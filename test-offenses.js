#!/usr/bin/env node

// Test script to verify QRadar offenses API
import { config } from 'dotenv';
import { request, Agent } from 'undici';

// Load environment variables
config();

const baseUrl = process.env.QRADAR_API_BASE_URL;
const apiToken = process.env.QRADAR_API_TOKEN;
const authHeader = process.env.QRADAR_AUTH_HEADER || 'SEC';
const apiVersion = process.env.QRADAR_API_VERSION || '18.0';
const tlsVerify = process.env.QRADAR_TLS_VERIFY === 'true';

console.log('Testing QRadar Offenses API...');
console.log(`Base URL: ${baseUrl}`);
console.log(`TLS Verify: ${tlsVerify}`);
console.log(`API Version: ${apiVersion}`);

// Create dispatcher for TLS settings
const dispatcher = new Agent({
  connect: {
    rejectUnauthorized: tlsVerify
  }
});

async function testOffenses() {
  try {
    const url = `${baseUrl}/api/siem/offenses`;
    const params = new URLSearchParams({
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
    console.log(`Content-Type: ${response.headers['content-type']}`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json();
      console.log('\n✅ Offenses API successful!');
      console.log(`Found ${data.length} offenses`);
      
      if (data.length > 0) {
        console.log('\nFirst 3 Offenses:');
        data.slice(0, 3).forEach(offense => {
          console.log(`  - ID: ${offense.id}, Description: ${offense.description || 'N/A'}, Status: ${offense.status || 'N/A'}`);
        });
      } else {
        console.log('\nNo offenses found in the system.');
      }
      
      console.log('\nFull response structure:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.body.text();
      console.error(`\n❌ Error: ${response.statusCode}`);
      console.error(errorText);
    }
  } catch (error) {
    console.error('\n❌ Request failed:');
    console.error(error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
  }
}

testOffenses();

// Made with Bob