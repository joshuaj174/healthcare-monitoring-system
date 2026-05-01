const axios = require('axios');
const Hospital = require('../models/Hospital');

const WHO_BASE = 'https://ghoapi.azureedge.net/api';

// WHO country codes mapped to your conflict regions
const COUNTRY_MAP = {
  PSE: 'Palestine', SYR: 'Syria',    AFG: 'Afghanistan',
  SOM: 'Somalia',  SSD: 'South Sudan', YEM: 'Yemen',
  LBY: 'Libya',    SDN: 'Sudan',     CAF: 'CAR',
  COD: 'DRC',      IRQ: 'Iraq',      UKR: 'Ukraine',
  NGA: 'Nigeria',  TCD: 'Chad',      ETH: 'Ethiopia',
  KEN: 'Kenya',    NER: 'Niger',
};

// Countries for Overpass (OpenStreetMap)
const OSM_COUNTRIES = [
  'Palestine', 'Syria', 'Afghanistan', 'Somalia',
  'South Sudan', 'Yemen', 'Libya', 'Sudan',
  'Central African Republic', 'Democratic Republic of Congo',
  'Iraq', 'Ukraine', 'Nigeria', 'Chad', 'Ethiopia',
];

// ─────────────────────────────────────────────
// 1. WHO API — Medicine Supply Sync
// ─────────────────────────────────────────────
const fetchWHOMedicineData = async () => {
  try {
    console.log('[WHO API] Fetching medicine supply data...');

    const countryCodes = Object.keys(COUNTRY_MAP);
    const filterStr = countryCodes.map(c => `SpatialDim eq '${c}'`).join(' or ');

    const url = `${WHO_BASE}/UHC_INDEX_REPORTED?$filter=${filterStr}&$orderby=TimeDim desc`;

    const response = await axios.get(url, { timeout: 15000 });
    const records = response.data?.value || [];

    if (records.length === 0) {
      console.log('[WHO API] No records returned — skipping');
      return;
    }

    console.log(`[WHO API] Got ${records.length} records`);

    const latestByCountry = {};
    for (const r of records) {
      const code = r.SpatialDim;
      if (!latestByCountry[code] && r.NumericValue != null) {
        latestByCountry[code] = Math.round(r.NumericValue);
      }
    }

    let totalUpdated = 0;
    for (const [code, score] of Object.entries(latestByCountry)) {
      const keyword = COUNTRY_MAP[code];
      if (!keyword) continue;

      const result = await Hospital.updateMany(
        { region: { $regex: keyword, $options: 'i' } },
        { $set: { medicineSupply: score } }
      );

      totalUpdated += result.modifiedCount;
      console.log(`[WHO API] ${keyword}: medicineSupply → ${score}`);
    }

    console.log(`[WHO API] Sync complete. Updated ${totalUpdated} hospitals.`);

  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      console.log('[WHO API] Timeout — simulation data will be used instead');
    } else {
      console.error('[WHO API] Error:', err.message);
    }
  }
};

// ─────────────────────────────────────────────
// 2. OpenStreetMap (Overpass API) — Hospital Location Sync
// ─────────────────────────────────────────────
const fetchOSMLocations = async () => {
  try {
    console.log('[Overpass API] Fetching hospital locations...');
    let totalUpdated = 0;

    for (const country of OSM_COUNTRIES) {
      try {
        const query = `
          [out:json][timeout:25];
          area["name"="${country}"]->.searchArea;
          node["amenity"="hospital"](area.searchArea);
          out body;
        `;

        // Overpass interpreter expects query in form field "data".
       const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const CONFLICT_BBOXES = {
  'Palestine':   '31.2,34.2,31.6,34.6',
  'Syria':       '33.0,35.7,37.3,42.4',
  'Afghanistan': '29.4,60.5,38.5,74.9',
  'Somalia':     '1.6,41.0,2.4,45.5',
  'South Sudan': '4.0,30.0,10.0,35.0',
  'Yemen':       '12.5,42.5,18.0,54.0',
  'Libya':       '19.5,9.3,33.2,25.2',
  'Sudan':       '8.7,21.8,22.2,38.6',
  'Iraq':        '29.0,38.8,37.4,48.8',
  'Ukraine':     '44.4,22.1,52.4,40.2',
};

const fetchOSMHospitalLocations = async () => {
  try {
    console.log('[OSM] Fetching hospital locations via Overpass...');
    let totalUpdated = 0;

    for (const [country, bbox] of Object.entries(CONFLICT_BBOXES)) {
      try {
        const query = `[out:json][timeout:25];node["amenity"="hospital"](${bbox});out body;`;

        const response = await axios.post(
          OVERPASS_URL,
          `data=${encodeURIComponent(query)}`,
          {
            timeout: 30000,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept':       'application/json',
              'User-Agent':   'HealthcareMonitorApp/1.0',
            },
          }
        );

        const elements = response.data?.elements || [];
        console.log(`[OSM] ${country}: ${elements.length} hospitals found`);

        for (const el of elements) {
          const name = el.tags?.name;
          const lat  = el.lat;
          const lng  = el.lon;
          if (!name || !lat || !lng) continue;

          const existing = await Hospital.findOne({
            region: { $regex: country.split(' ')[0], $options: 'i' },
            name:   { $regex: name.split(' ')[0], $options: 'i' },
          });

          if (existing) {
            existing.latitude  = parseFloat(lat);
            existing.longitude = parseFloat(lng);
            await existing.save();
            totalUpdated++;
            console.log(`[OSM] Updated location: ${existing.name}`);
          }
        }

        // Wait 2s between countries — Overpass rate limit
        await new Promise(r => setTimeout(r, 2000));

      } catch (countryErr) {
        console.log(`[OSM] Failed for ${country}:`, countryErr.message);
        continue;
      }
    }

    console.log(`[OSM] Sync complete. Updated ${totalUpdated} hospitals.`);

  } catch (err) {
    console.error('[OSM] Error:', err.message);
  }
};

        // Run the inner bbox-based sync implementation.
        await fetchOSMHospitalLocations();

        // Prevent rate limiting
        await new Promise(r => setTimeout(r, 1500));

      } catch (countryErr) {
        console.log(`[Overpass] Failed for ${country}:`, countryErr.message);
        continue;
      }
    }

    console.log(`[Overpass] Location sync complete. Updated ${totalUpdated} hospitals.`);

  } catch (err) {
    console.error('[Overpass] Error:', err.message);
  }
};

// ─────────────────────────────────────────────
// 3. Start both syncs
// ─────────────────────────────────────────────
const startExternalSync = () => {
  // WHO — every 6 hours
  fetchWHOMedicineData();
  setInterval(fetchWHOMedicineData, 6 * 60 * 60 * 1000);

  // OSM — every 24 hours
  setTimeout(() => {
    fetchOSMLocations();
    setInterval(fetchOSMLocations, 24 * 60 * 60 * 1000);
  }, 30000);
};

module.exports = {
  startExternalSync,
  fetchWHOMedicineData,
  fetchOSMLocations
};