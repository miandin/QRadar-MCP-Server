#!/usr/bin/env node

// Test the MCP tool directly
import { config } from 'dotenv';
config();

// Import the tool function
import { listOffenses } from './dist/tools/listOffenses.js';

async function testMcpTool() {
  try {
    console.log('Testing list_offenses MCP tool...\n');
    
    const result = await listOffenses({
      limit: 10
    });
    
    console.log('✅ Tool executed successfully!');
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\nResult structure:');
    console.log(`- items: ${Array.isArray(result.items) ? 'array' : typeof result.items} (length: ${result.items?.length ?? 'N/A'})`);
    console.log(`- next_start: ${result.next_start ?? 'undefined'}`);
    console.log(`- ui_link: ${result.ui_link ?? 'undefined'}`);
    
  } catch (error) {
    console.error('❌ Tool execution failed:');
    console.error(error);
  }
}

testMcpTool();

// Made with Bob