#!/usr/bin/env node

/**
 * Script to parse and update canonical prayer time data from local Tawkit data or remote AWQAF source.
 * Run to ensure prayer time calculations remain in exact sync with official AWQAF data.
 * 
 * Usage: npm run update:canonical-data
 */

const fs = require('fs');
const path = require('path');

const LOCAL_TAWKIT_DIR = '/Users/rock/Downloads/tawkit-9.63-html-db084/data/BH';
const OUTPUT_PATH = path.join(__dirname, '..', 'lib', 'canonical-data.json');

function parseTawkitContent(content) {
  const map = {};
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line.startsWith('"') && line.includes('~~~~~')) {
      const clean = line.replace(/^"/, '').replace(/",?$/, '');
      const [mmdd, timesStr] = clean.split('~~~~~');
      const [fajr, shurooq, dhuhr, asr, maghrib, isha] = timesStr.split('|');
      map[mmdd] = { fajr, shurooq, dhuhr, asr, maghrib, isha };
    }
  });
  return map;
}

function updateCanonicalData() {
  console.log('🕌 Updating canonical prayer time data from Bahrain AWQAF...');

  let awqafMap = {};
  let manamaMap = {};

  const awqafPath = path.join(LOCAL_TAWKIT_DIR, 'wtimes-bh.awqaf.js');
  const manamaPath = path.join(LOCAL_TAWKIT_DIR, 'wtimes-bh.manama-awqaf.js');

  if (fs.existsSync(awqafPath)) {
    console.log(`Reading local AWQAF data from ${awqafPath}`);
    awqafMap = parseTawkitContent(fs.readFileSync(awqafPath, 'utf8'));
  } else {
    throw new Error(`Local AWQAF file not found at ${awqafPath}`);
  }

  if (fs.existsSync(manamaPath)) {
    console.log(`Reading local Manama AWQAF data from ${manamaPath}`);
    manamaMap = parseTawkitContent(fs.readFileSync(manamaPath, 'utf8'));
  }

  const canonical = {};

  // Add all MM-DD entries from official AWQAF data
  Object.keys(awqafMap).sort().forEach(mmdd => {
    canonical[mmdd] = awqafMap[mmdd];
  });

  // Ensure leap day 02-29 is present (from manama-awqaf if missing in awqaf)
  if (!canonical['02-29'] && manamaMap['02-29']) {
    canonical['02-29'] = manamaMap['02-29'];
  }

  // Also include 2024-MM-DD entries for backward compatibility with existing tests/tools
  Object.keys(canonical).forEach(mmdd => {
    if (!mmdd.startsWith('2024-')) {
      canonical[`2024-${mmdd}`] = canonical[mmdd];
    }
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(canonical, null, 2) + '\n', 'utf8');
  console.log(`✅ Successfully saved canonical data to ${OUTPUT_PATH} (${Object.keys(canonical).length} entries)`);
}

updateCanonicalData();
