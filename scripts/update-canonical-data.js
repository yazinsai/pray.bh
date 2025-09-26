#!/usr/bin/env node

/**
 * Script to fetch and update canonical prayer time data from Bahrain AWQAF
 * Run yearly to ensure prayer time calculations remain in sync with official data
 * 
 * Usage: npm run update:canonical-data
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const AWQAF_URL = 'https://offline.tawkit.net/data/BH/wtimes-BH.AWQAF.js';
const OUTPUT_PATH = path.join(__dirname, '..', 'lib', 'canonical-data.json');

console.log('🕌 Fetching latest prayer time data from Bahrain AWQAF...');
console.log(`Source: ${AWQAF_URL