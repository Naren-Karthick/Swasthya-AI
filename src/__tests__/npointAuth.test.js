import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { 
  NPOINT_DB_URL,
  saveDemoReport,
  getDemoReports,
  clearDemoReports
} from '../api.js';

describe('Swasthya AI — npoint Database & History Adapter Tests', () => {
  before(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = new Map();
      globalThis.localStorage = {
        getItem: (k) => store.get(k) || null,
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear()
      };
    }
  });

  test('NPOINT_DB_URL is correctly configured to user cloud bin', () => {
    assert.equal(typeof NPOINT_DB_URL, 'string');
    assert.ok(NPOINT_DB_URL.startsWith('https://api.npoint.io/ead356d4d55965c0a760'));
  });

  test('Local demo persistence persists triage assessments with full clinical metadata', () => {
    clearDemoReports();

    const sampleReport = {
      urgencyLevel: 'EMERGENCY',
      urgencyState: 'Emergency — act now',
      primaryAssessment: 'Suspected acute coronary syndrome.',
      recommendedAction: 'Call 108 immediately'
    };

    const patientInfo = {
      id: 'TEST-CASE-01',
      symptoms: 'Crushing chest pain radiating to left jaw',
      ageGroup: 'Senior (65+ years)',
      duration: '1',
      language: 'English',
      date: '2026-09-17T06:00:00.000Z'
    };

    const saved = saveDemoReport(sampleReport, patientInfo);
    assert.ok(Array.isArray(saved));
    assert.ok(saved.length >= 1);

    const first = saved[0];
    assert.equal(first.id, 'TEST-CASE-01');
    assert.equal(first.urgencyLevel, 'EMERGENCY');
    assert.equal(first.urgencyState, 'Emergency — act now');
    assert.equal(first.symptoms, 'Crushing chest pain radiating to left jaw');
    assert.equal(first.fullAssessment.primaryAssessment, 'Suspected acute coronary syndrome.');

    // Verify retrieve
    const retrieved = getDemoReports();
    assert.equal(retrieved.length, saved.length);
    assert.equal(retrieved[0].id, 'TEST-CASE-01');

    // Clean up
    clearDemoReports();
    assert.equal(getDemoReports().length, 0);
  });
});
