
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const factorsJson = JSON.parse(fs.readFileSync(path.join(__dirname, "extraction-factors.json"), "utf8"));
const storageCode = fs.readFileSync(path.join(__dirname, "utils/storage.js"), "utf8");
const labCode = fs.readFileSync(path.join(__dirname, "lab-extraction.jsx"), "utf8");
const appCode = fs.readFileSync(path.join(__dirname, "simulador-app.jsx"), "utf8");

// Mirror the pure calculation logic
function calculateYield(biomassGrams, speciesKey, methodKey, factors = factorsJson) {
  const spp = factors[speciesKey];
  if (!spp || !spp.methods[methodKey]) return { yieldGrams: 0, yieldPct: 0 };
  const factor = spp.methods[methodKey].yield_factor;
  const yieldGrams = Number((biomassGrams * factor).toFixed(2));
  const yieldPct = Number((factor * 100).toFixed(1));
  return { yieldGrams, yieldPct };
}

function calculateCost(biomassGrams, solventLiters, speciesKey, methodKey, rawBiomassCostPerKg = 45000, factors = factorsJson) {
  const spp = factors[speciesKey];
  const method = spp && spp.methods[methodKey];
  const solventCostPerLiter = method ? method.cost_per_liter_solvent : 15000;
  const biomassCost = (biomassGrams / 1000) * rawBiomassCostPerKg;
  const solventCost = (solventLiters || 0) * solventCostPerLiter;
  const totalCost = Math.round(biomassCost + solventCost);
  const { yieldGrams } = calculateYield(biomassGrams, speciesKey, methodKey, factors);
  const costPerGramExtract = yieldGrams > 0 ? Math.round(totalCost / yieldGrams) : 0;
  return { biomassCost, solventCost, totalCost, costPerGramExtract };
}

test("Lab Extraction — calculations, yields, costs and component integration", async (t) => {
  await t.test("calculates yield accurately based on species and extraction method factors", () => {
    const res = calculateYield(1000, "shiitake", "hidroalcoholica", factorsJson);
    assert.equal(res.yieldGrams, 140);
    assert.equal(res.yieldPct, 14.0);

    const uae = calculateYield(500, "shiitake", "ultrasonido", factorsJson);
    assert.equal(uae.yieldGrams, 100);
    assert.equal(uae.yieldPct, 20.0);
  });

  await t.test("calculates operational extraction batch cost and cost per gram", () => {
    // 500g biomass @ $45,000/kg = $22,500
    // 2.5L solvent @ $18,000/L = $45,000
    // Total = $67,500
    // Yield = 500 * 0.14 = 70g
    // Cost/g = 67500 / 70 = 964 COP/g
    const cost = calculateCost(500, 2.5, "shiitake", "hidroalcoholica", 45000, factorsJson);
    assert.equal(cost.biomassCost, 22500);
    assert.equal(cost.solventCost, 45000);
    assert.equal(cost.totalCost, 67500);
    assert.equal(cost.costPerGramExtract, 964);
  });

  await t.test("lab-extraction.jsx defines batch table, QR code generator and PDF/text export", () => {
    assert.match(labCode, /generateBatchQrDataUrl/);
    assert.match(labCode, /exportBatchPdfStub/);
    assert.match(labCode, /saveBatches/);
    assert.match(labCode, /loadBatches/);
    assert.match(labCode, /Laboratorio de Extracciones/);
  });

  await t.test("simulador-app.jsx integrates navigation tabs for labExtraction and bioCheck", () => {
    assert.match(appCode, /labExtraction/);
    assert.match(appCode, /bioCheck/);
    assert.match(appCode, /<LabExtraction/);
    assert.match(appCode, /<BioCheck/);
  });

  await t.test("Setas OS v5.dc.html includes labExtraction and bioCheck in allowlists and workspace maps", () => {
    const shellCode = fs.readFileSync(path.join(__dirname, "Setas OS v5.dc.html"), "utf8");
    assert.match(shellCode, /allowedTabs=\[[^\]]*'labExtraction'[^\]]*'bioCheck'/);
    assert.match(shellCode, /onSimTabChange:\(tab\)=>\{[\s\S]*?allowed=\[[^\]]*'labExtraction'[^\]]*'bioCheck'/);
    assert.match(shellCode, /SIM_CRUMB = \{[^}]*bioCheck:'Bio-Check'[^}]*labExtraction:'Laboratorio'/);
    assert.match(shellCode, /SIM_WORKSPACE = \{[^}]*bioCheck:'Producción'[^}]*labExtraction:'Producción'/);
  });
});
