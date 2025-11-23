import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
import { ArielSearchStatus } from '../types/qradar.js';

// Input schema for search_ariel tool
export const searchArielInputSchema = z.object({
  aql: z.string().min(1).describe('AQL query to execute'),
  timeout_ms: z.number().int().positive().optional().default(30000).describe('Timeout in milliseconds'),
});

// Output schema for search_ariel tool
export const searchArielOutputSchema = z.object({
  status: z.enum(['COMPLETED', 'RUNNING', 'FAILED']).describe('Status of the search'),
  rows: z.array(z.any()).optional().describe('Result rows if search is completed'),
  search_id: z.string().optional().describe('Search ID for tracking long-running searches'),
  ui_link: z.string().optional().describe('Link to the search results in QRadar UI'),
});

// Type definitions for input and output
export type SearchArielInput = z.infer<typeof searchArielInputSchema>;
export type SearchArielOutput = z.infer<typeof searchArielOutputSchema>;

/**
 * Execute an Ariel search query
 */
export async function searchAriel(input: SearchArielInput): Promise<SearchArielOutput> {
  const { aql, timeout_ms = 30000 } = input;

  try {
    // Start the search
    const searchResponse = await qradarClient.post<{ search_id: string }>('/ariel/searches', {
      query_expression: aql,
    });

    const searchId = searchResponse.search_id;
    const startTime = Date.now();
    let status: ArielSearchStatus;
    
    // Poll for search completion with timeout
    do {
      // Check if timeout has been reached
      if (Date.now() - startTime > timeout_ms) {
        // Return the search ID so the client can check status later
        return {
          status: 'RUNNING',
          search_id: searchId,
          ui_link: deeplinkBuilder.arielSearch(aql),
        };
      }
      
      // Wait a bit before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check search status
      status = await qradarClient.get<ArielSearchStatus>(`/ariel/searches/${searchId}`);
      
    } while (status.status !== 'COMPLETED' && status.status !== 'ERROR' && status.status !== 'CANCELED');

    // If search failed
    if (status.status === 'ERROR' || status.status === 'CANCELED') {
      return {
        status: 'FAILED',
        ui_link: deeplinkBuilder.arielSearch(aql),
      };
    }

    // If search completed successfully, get results
    const results = await qradarClient.get<{ events?: any[], flows?: any[] }>(
      `/ariel/searches/${searchId}/results`
    );

    // Return the results
    return {
      status: 'COMPLETED',
      rows: results.events || results.flows || [],
      ui_link: deeplinkBuilder.arielSearch(aql),
    };
  } catch (error) {
    console.error('Error executing Ariel search:', error);
    throw error;
  }
}

// Made with Bob
