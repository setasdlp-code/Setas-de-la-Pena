#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";

const EXPECTED_VERSION = "3.0.22";
const TARGET_RELATIVE_PATH = join(
  "@musistudio",
  "claude-code-router",
  "dist",
  "main",
  "upstream-header-sanitizer.js"
);

const metadataOriginal =
  "return i&&r.metadata===void 0&&(o.metadata={user_id:i}),Object.keys(o).length===0?n:{...n,body:{...r,...o}}}";
const metadataPatched =
  'return i&&r.metadata===void 0&&!String(e.targetProviderConfig?.baseurl??"").includes("chatgpt.com/backend-api/codex")&&(o.metadata={user_id:i}),Object.keys(o).length===0?n:{...n,body:{...r,...o}}}';
const headerPatched =
  'function D(e,n,s,r){let i=m(e,n);if(s?.type?.trim().toLowerCase()!=="anthropic_messages"||String(r?.model??"").toLowerCase().includes("claude-opus"))return i;for(let[o,t]of Object.entries(i))if(o.trim().toLowerCase()==="anthropic-beta"){let y=String(t).split(",").map(E=>E.trim()).filter(E=>E&&!E.startsWith("context-1m-")).join(",");y?i[o]=y:delete i[o]}return i}';

function usage() {
  console.error("Usage: node tools/ccr/apply-local-hotfix.mjs --check|--apply [--file path]");
  process.exitCode = 2;
}

function parseArgs(args) {
  let mode;
  let target;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--check" || arg === "--apply") {
      if (mode) usage();
      mode = arg;
      continue;
    }
    if (arg === "--file") {
      target = args[index + 1];
      index += 1;
      if (!target) usage();
      continue;
    }
    usage();
    return {};
  }

  if (!mode) usage();
  return { mode, target };
}

function defaultTarget() {
  const candidates = [
    join(resolve(dirname(process.execPath), "..", "lib", "node_modules"), TARGET_RELATIVE_PATH)
  ];

  try {
    const ccrCli = execFileSync("which", ["ccr"], { encoding: "utf8" }).trim();
    candidates.push(join(resolve(dirname(ccrCli), "..", "lib", "node_modules"), TARGET_RELATIVE_PATH));
  } catch {
    // Fall back to npm's global root below when the CCR CLI is not on PATH.
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const globalRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
  return join(globalRoot, TARGET_RELATIVE_PATH);
}

function versionFor(target) {
  const packagePath = resolve(dirname(target), "..", "..", "package.json");
  if (!existsSync(packagePath)) {
    throw new Error(`Cannot find CCR package.json next to ${target}`);
  }
  return JSON.parse(readFileSync(packagePath, "utf8")).version;
}

function replaceExactlyOnce(source, original, replacement, label) {
  const occurrences = source.split(original).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${label} source anchor changed (expected 1 match, found ${occurrences}).`);
  }
  return source.replace(original, replacement);
}

function patchHeaderSanitizer(source) {
  const headerOriginal = /function D\(e,n(?:,s,r)?\)\{return m\(e,n\)\}/;
  const headerMatches = source.match(headerOriginal);
  if (!headerMatches || headerMatches.length !== 1) {
    throw new Error("Header sanitizer source anchor changed (expected the unpatched merge-only function).");
  }

  let patched = replaceExactlyOnce(source, metadataOriginal, metadataPatched, "Responses metadata");
  patched = patched.replace(headerOriginal, headerPatched);
  return patched;
}

function inspect(source) {
  return {
    metadata: source.includes(metadataPatched),
    betaHeader: source.includes(headerPatched)
  };
}

async function main() {
  const { mode, target: suppliedTarget } = parseArgs(process.argv.slice(2));
  if (!mode) return;

  const target = suppliedTarget ? resolve(suppliedTarget) : defaultTarget();
  if (!existsSync(target)) {
    throw new Error(`CCR sanitizer not found: ${target}`);
  }

  const version = versionFor(target);
  if (version !== EXPECTED_VERSION) {
    throw new Error(`CCR ${version} found; this hotfix is locked to ${EXPECTED_VERSION}.`);
  }

  const source = readFileSync(target, "utf8");
  const state = inspect(source);
  if (mode === "--check") {
    if (!state.metadata || !state.betaHeader) {
      throw new Error(`CCR ${EXPECTED_VERSION} is missing: ${[
        !state.metadata && "Codex metadata guard",
        !state.betaHeader && "non-Opus context-1m header guard"
      ].filter(Boolean).join(", ")}.`);
    }
    console.log(`CCR ${EXPECTED_VERSION} hotfix is present: ${target}`);
    return;
  }

  if (state.metadata || state.betaHeader) {
    throw new Error("Refusing a partial or already-patched source file; use --check or restore the package first.");
  }

  const patched = patchHeaderSanitizer(source);
  writeFileSync(target, patched, "utf8");
  console.log(`Applied CCR ${EXPECTED_VERSION} hotfix: ${target}`);
}

main().catch((error) => {
  console.error(`CCR hotfix failed: ${error.message}`);
  process.exitCode = 1;
});
