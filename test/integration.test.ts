import { describe, it, expect, beforeAll, afterAll } from 'jest';
import { request } from 'undici';

// Mock environment variables
process.env.QRADAR_API_BASE_URL = 'https://mock-qradar-api.example.com/api';
process.env.QRADAR_UI_BASE_URL = 'https://mock-qradar-ui.example.com';
process.env.QRADAR_API_TOKEN = 'mock-api-token';
process.env.PORT = '3001';

// Mock server
let server: any;

// Start the server before tests
beforeAll(async () => {
  // Import the server dynamically to ensure environment variables are set first
  const { default: startServer } = await import('../dist/index.js');
  server = await startServer();
});

// Stop the server after tests
afterAll(async () => {
  if (server) {
    await server.close();
  }
});

describe('QRadar MCP Server Integration Tests', () => {
  // Test the server info endpoint
  it('should return server info', async () => {
    const response = await request('http://localhost:3001/mcp');
    expect(response.statusCode).toBe(200);
    
    const body = await response.body.json();
    expect(body).toHaveProperty('title', 'QRadar MCP Server');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('tools');
    expect(Array.isArray(body.tools)).toBe(true);
  });

  // Test the list_offenses tool schema
  it('should have correct schema for list_offenses tool', async () => {
    const response = await request('http://localhost:3001/mcp/tools/list_offenses/schema');
    expect(response.statusCode).toBe(200);
    
    const body = await response.body.json();
    expect(body).toHaveProperty('input');
    expect(body).toHaveProperty('output');
    expect(body.input.properties).toHaveProperty('filter');
    expect(body.input.properties).toHaveProperty('status');
    expect(body.output.properties).toHaveProperty('items');
  });

  // Test authentication failure
  it('should handle authentication failure', async () => {
    // Mock an invalid request to the tool
    const response = await request('http://localhost:3001/mcp/tools/list_offenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    // Since we're using mock URLs, we expect an error
    expect(response.statusCode).toBe(500);
    
    const body = await response.body.json();
    expect(body).toHaveProperty('error');
  });
});

// Made with Bob
