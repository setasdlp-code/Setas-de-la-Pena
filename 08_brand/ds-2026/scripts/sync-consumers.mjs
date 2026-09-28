#!/usr/bin/env node
/**
 * Deterministic distribution of canonical DS-2026 into Setas OS.
 * The target is a generated artifact: distribution-manifest.json is the
 * complete contract for every copied runtime/documentation file and asset tree.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const CANON_DIR=path.resolve(__dirname,'..');
const REPO_ROOT=path.resolve(CANON_DIR,'..','..');
const TARGET_DIR=path.join(REPO_ROOT,'field-os-simulador','setas-os','ds-2026');
const manifest=JSON.parse(fs.readFileSync(path.join(CANON_DIR,'distribution-manifest.json'),'utf8'));

function copyFile(rel){
  const src=path.join(CANON_DIR,rel), dest=path.join(TARGET_DIR,rel);
  if(!fs.existsSync(src)) throw new Error('Missing canonical distribution file: '+rel);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.copyFileSync(src,dest);
}
function walkFiles(root,relBase=''){
  const out=[];
  for(const ent of fs.readdirSync(root,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
    if(['.DS_Store','node_modules','.git'].includes(ent.name)) continue;
    const abs=path.join(root,ent.name), rel=path.join(relBase,ent.name);
    if(ent.isDirectory()) out.push(...walkFiles(abs,rel)); else out.push(rel);
  }
  return out;
}
function copyTree(relTree){
  const srcRoot=path.join(CANON_DIR,relTree), destRoot=path.join(TARGET_DIR,relTree);
  if(!fs.existsSync(srcRoot)) throw new Error('Missing canonical asset tree: '+relTree);
  fs.rmSync(destRoot,{recursive:true,force:true});
  for(const child of walkFiles(srcRoot)){
    const src=path.join(srcRoot,child), dest=path.join(destRoot,child);
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.copyFileSync(src,dest);
  }
}
function expectedFiles(){
  const base=['distribution-manifest.json',...manifest.files,...manifest.tokens,...manifest.components];
  for(const tree of manifest.assetTrees||[]) for(const child of walkFiles(path.join(CANON_DIR,tree))) base.push(path.join(tree,child));
  return [...new Set(base)].sort();
}
function packageFiles(){
  if(!fs.existsSync(TARGET_DIR)) return [];
  return walkFiles(TARGET_DIR).sort();
}

console.log('sync DS-2026 canonical -> Setas OS package');
fs.rmSync(TARGET_DIR,{recursive:true,force:true});
fs.mkdirSync(TARGET_DIR,{recursive:true});
copyFile('distribution-manifest.json');
for(const rel of manifest.files) copyFile(rel);
for(const rel of manifest.tokens) copyFile(rel);
for(const rel of manifest.components) copyFile(rel);
for(const tree of manifest.assetTrees||[]) copyTree(tree);

const expected=expectedFiles(), actual=packageFiles();
let errors=0;
if(JSON.stringify(expected)!==JSON.stringify(actual)){
  const exp=new Set(expected), act=new Set(actual);
  for(const x of expected) if(!act.has(x)){ console.error('missing target file:',x); errors++; }
  for(const x of actual) if(!exp.has(x)){ console.error('unexpected target file:',x); errors++; }
}
for(const rel of expected){
  const a=fs.readFileSync(path.join(CANON_DIR,rel)), b=fs.readFileSync(path.join(TARGET_DIR,rel));
  if(!a.equals(b)){ console.error('content drift:',rel); errors++; }
}
if(errors){ console.error('DS distribution failed with '+errors+' problem(s)'); process.exit(1); }
console.log('DS distribution clean: '+expected.length+' files, exact manifest/tree parity');
