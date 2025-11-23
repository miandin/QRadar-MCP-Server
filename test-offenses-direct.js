#!/usr/bin/env node

// Test script to verify QRadar offenses API with correct path
import { config } from 'dotenv';
import { request, Agent } from 'undici';

// Load environment variables
config();

const baseUrl = 'https://9.30.144.27/api';  // Hardcoded correct base URL
const apiToken = process.env.QRADAR_API_TOKEN;
const authHeader = process.env.QRADAR_AUTH_HEADER || 'SEC';
const apiVersion = process.env.QRADAR_API_VERSION || '18.0';
const tlsVerify = false;

console.log('Testing QRadar Offenses API with correct path...');
console.log(`Base URL: ${baseUrl}`);

// Create dispatcher for TLS settings
const dispatcher = new Agent({
  connect: {
    rejectUnauthorized: tlsVerify
  }
});

async function testOffenses() {
  try {
    const url = `${baseUrl}/siem/offenses`;
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
      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('application/json')) {
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
      } else {
        const text = await response.body.text();
        console.log('\n⚠️  Response is not JSON:');
        console.log(text.substring(0, 500));
      }
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