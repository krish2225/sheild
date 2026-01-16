import Prediction from '../models/Prediction.js';
import Machine from '../models/Machine.js';
import { ok, created, badRequest } from '../utils/response.js';

// Simple feature scoring helper to emulate an ML model
function computeRiskAndRul(features) {
  // Reference ranges (domain-assumed). Values are clamped to [0,1] as abnormality score
  const norm = (v, min, max) => {
    if (v === undefined || v === null || Number.isNaN(Number(v))) return 0;
    const x = (Number(v) - min) / (max - min);
    return Math.max(0, Math.min(1, x));
  };

  const vib = norm(features.vibration ?? 0, 0, 50); // mm/s
  const temp = norm(features.temperature ?? 0, 40, 120); // °C, >40 starts concern
  const curr = norm(features.current ?? 0, 0, 20); // A
  // Removed rms/kurtosis/skewness from scoring as requested

  // Weights should sum ~1
  const weights = {
    vibration: 0.3,
    temperature: 0.2,
    current: 0.1,
    // redistribute weights
    rms: 0,
    kurtosis: 0,
    skewness: 0,
    // keep the totals ~1 by normalizing
  };

  const contrib = {
    vibration: vib * weights.vibration,
    temperature: temp * weights.temperature,
    current: curr * weights.current,
    rms: 0,
    kurtosis: 0,
    skewness: 0,
  };

  const rawRisk = Object.values(contrib).reduce((a, b) => a + b, 0);
  const risk = Math.max(0, Math.min(1, rawRisk));
  const label = risk > 0.5 ? 'faulty' : 'normal';
  const confidence = Number(risk.toFixed(2));

  // RUL inversely proportional to risk (in hours), clamp [10, 500]
  const rulHours = Math.max(10, Math.round((1 - risk) * 400) + 50);

  const totalContrib = Object.values(contrib).reduce((a, b) => a + b, 0) || 1;
  const featureImportance = {
    vibration: Number((contrib.vibration / totalContrib).toFixed(2)),
    temperature: Number((contrib.temperature / totalContrib).toFixed(2)),
    current: Number((contrib.current / totalContrib).toFixed(2)),
  };

  return { label, confidence, rulHours, featureImportance };
}

// Stub prediction endpoint to integrate later with Python/ML
export const predict = async (req, res) => {
  const { machineId, features = {} } = req.body;
  if (!machineId) return badRequest(res, 'machineId required');

  const machine = await Machine.findOne({ machineId });
  if (!machine) return badRequest(res, 'Unknown machineId');

  // heuristic scoring to emulate ML output across multiple features
  const scored = computeRiskAndRul(features);

  const record = await Prediction.create({
    machine: machine._id,
    machineId,
    classification: {
      label: scored.label,
      confidence: scored.confidence,
    },
    rulHours: scored.rulHours,
    featureImportance: scored.featureImportance,
    input: features,
  });

  return created(res, { prediction: record });
};

// CSV upload: expects headers like machineId,vibration,temperature,current
export const predictCsv = async (req, res) => {
  try {
    if (!req.file) return badRequest(res, 'CSV file is required');
    const text = req.file.buffer.toString('utf-8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return badRequest(res, 'CSV appears empty');
    const headers = lines[0].split(',').map((h) => h.trim());
    const idx = {
      machineId: headers.indexOf('machineId'),
      vibration: headers.indexOf('vibration'),
      temperature: headers.indexOf('temperature'),
      current: headers.indexOf('current'),
      rms: headers.indexOf('rms'),
      kurtosis: headers.indexOf('kurtosis'),
      skewness: headers.indexOf('skewness'),
    };
    if (idx.machineId === -1) return badRequest(res, 'CSV must include machineId column');

    const results = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (!cols.length) continue;
      const machineId = (cols[idx.machineId] || '').trim();
      if (!machineId) continue;
      const features = {
        vibration: idx.vibration >= 0 ? Number(cols[idx.vibration] || 0) : undefined,
        temperature: idx.temperature >= 0 ? Number(cols[idx.temperature] || 0) : undefined,
        current: idx.current >= 0 ? Number(cols[idx.current] || 0) : undefined,
        rms: idx.rms >= 0 ? Number(cols[idx.rms] || 0) : undefined,
        kurtosis: idx.kurtosis >= 0 ? Number(cols[idx.kurtosis] || 0) : undefined,
        skewness: idx.skewness >= 0 ? Number(cols[idx.skewness] || 0) : undefined,
      };

      const scored = computeRiskAndRul(features);

      results.push({
        row: i,
        machineId,
        classification: { label: scored.label, confidence: scored.confidence },
        rulHours: scored.rulHours,
      });
    }

    return ok(res, { count: results.length, results });
  } catch (err) {
    return badRequest(res, err.message || 'Failed to process CSV');
  }
};


