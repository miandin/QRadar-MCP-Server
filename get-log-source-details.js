#!/usr/bin/env node

import { config } from 'dotenv';
import { request, Agent } from 'undici';

config();

const baseUrl = process.env.QRADAR_API_BASE_URL;
const apiToken = process.env.QRADAR_API_TOKEN;
const authHeader = process.env.QRADAR_AUTH_HEADER || 'SEC';
const apiVersion = process.env.QRADAR_API_VERSION || '18.0';

const dispatcher = new Agent({
  connect: { rejectUnauthorized: false }
});

async function getLogSourceDetails() {
  try {
    const url = `${baseUrl}/api/config/event_sources/log_source_management/log_sources`;
    const params = new URLSearchParams({
      filter: "name ilike '%DNS analyzer%'",
      fields: 'id,name,type_id,enabled,status',
      limit: '10'
    });

    const response = await request(`${url}?${params.toString()}`, {
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
    
    console.log('\n=== QRadar Log Sources containing "DNS analyzer" ===\n');
    console.log('Raw response:', JSON.stringify(data, null, 2));
    console.log('\n');
    
    // Handle both array and single object responses
    const sources = Array.isArray(data) ? data : [data];
    
    if (sources.length === 0) {
      console.log('No log sources found.');
    } else {
      sources.forEach((source, index) => {
        console.log(`Log Source ${index + 1}:`);
        console.log(`  ID: ${source.id}`);
        console.log(`  Name: ${source.name}`);
        console.log(`  Type ID: ${source.type_id || 'N/A'}`);
        console.log(`  Type Name: ${source.type_name || 'N/A'}`);
        console.log(`  Enabled: ${source.enabled !== undefined ? source.enabled : 'N/A'}`);
        console.log(`  Status: ${source.status ? JSON.stringify(source.status) : 'N/A'}`);
        console.log('');
      });
      
      console.log(`Total: ${sources.length} log source(s) found\n`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getLogSourceDetails();

// Made with Bob
