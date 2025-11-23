#!/usr/bin/env node

// Simple test script to verify QRadar API connection
import { config } from 'dotenv';
import { request, Agent } from 'undici';

// Load environment variables
config();

const baseUrl = process.env.QRADAR_API_BASE_URL;
const apiToken = process.env.QRADAR_API_TOKEN;
const authHeader = process.env.QRADAR_AUTH_HEADER || 'SEC';
const apiVersion = process.env.QRADAR_API_VERSION || '18.0';
const tlsVerify = process.env.QRADAR_TLS_VERIFY === 'true';

console.log('Testing QRadar API connection...');
console.log(`Base URL: ${baseUrl}`);
console.log(`TLS Verify: ${tlsVerify}`);
console.log(`API Version: ${apiVersion}`);

// Create dispatcher for TLS settings
const dispatcher = new Agent({
  connect: {
    rejectUnauthorized: tlsVerify
  }
});

async function testConnection() {
  try {
    const url = `${baseUrl}/api/config/event_sources/log_source_management/log_sources`;
    const params = new URLSearchParams({
      filter: "name ilike '%DNS analyzer%'",
      limit: '10'
    });
    
    const fullUrl = `${url}?${params.toString()}`;
    console.log(`\nRequesting: ${fullUrl}`);
    
    const response = await request(fullUrl, {
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

    console.log(`\nResponse Status: ${response.statusCode}`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json();
      console.log('\n✅ Connection successful!');
      console.log(`Found ${data.length} log sources matching 'DNS analyzer'`);
      
      if (data.length > 0) {
        console.log('\nLog Sources:');
        data.forEach(source => {
          console.log(`  - ID: ${source.id}, Name: ${source.name}, Type: ${source.type_name || 'N/A'}`);
        });
      }
    } else {
      const errorText = await response.body.text();
      console.error(`\n❌ Error: ${response.statusCode}`);
      console.error(errorText);
    }
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error(error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
  }
}

testConnection();

// Made with Bob
