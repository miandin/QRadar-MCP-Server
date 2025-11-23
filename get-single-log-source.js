#!/usr/bin/env node

import { config } from 'dotenv';
import { request, Agent } from 'undici';

config();

const baseUrl = process.env.QRADAR_API_BASE_URL;
const apiToken = process.env.QRADAR_API_TOKEN;
const authHeader = 'SEC';
const apiVersion = '18.0';

const dispatcher = new Agent({
  connect: { rejectUnauthorized: false }
});

async function getLogSourceById(id) {
  try {
    const url = `${baseUrl}/api/config/event_sources/log_source_management/log_sources/${id}`;

    const response = await request(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Version': apiVersion,
        [authHeader]: apiToken
      },
      dispatcher,
      headersTimeout: 30000,
      bodyTimeout: 30000
    });

    const data = await response.body.json();
    
    console.log('\n=== Log Source Details ===\n');
    console.log(`ID: ${data.id || 'N/A'}`);
    console.log(`Name: ${data.name || 'N/A'}`);
    console.log(`Type ID: ${data.type_id || 'N/A'}`);
    console.log(`Description: ${data.description || 'N/A'}`);
    console.log(`Protocol Type ID: ${data.protocol_type_id || 'N/A'}`);
    console.log(`Enabled: ${data.enabled !== undefined ? data.enabled : 'N/A'}`);
    console.log(`Gateway: ${data.gateway !== undefined ? data.gateway : 'N/A'}`);
    console.log(`\nFull Response:`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getLogSourceById(262);

// Made with Bob
