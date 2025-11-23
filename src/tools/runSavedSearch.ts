import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
import { ArielSearchStatus, SavedSearch } from '../types/qradar.js';

// Input schema for run_saved_search tool
export const runSavedSearchInputSchema = z.object({
  search_id: z.string().min(1).describe('ID of the saved search to run'),
  timeout_ms: z.number().int().positive().optional().default(30000).describe('Timeout in milliseconds'),
});

// Output schema for run_saved_search tool
export const runSavedSearchOutputSchema = z.object({
  status: z.string().describe('Status of the search'),
  rows: z.array(z.any()).optional().describe('Result rows if search is completed'),
  ui_link: z.string().optional().describe('Link to the search results in QRadar UI'),
});

// Type definitions for input and output
export type RunSavedSearchInput = z.infer<typeof runSavedSearchInputSchema>;
export type RunSavedSearchOutput = z.infer<typeof runSavedSearchOutputSchema>;

/**
 * Run a saved search in QRadar
 */
export async function runSavedSearch(input: RunSavedSearchInput): Promise<RunSavedSearchOutput> {
  const { search_id, timeout_ms = 30000 } = input;

  try {
    // First, get the saved search details to get the query
    const savedSearch = await qradarClient.get<SavedSearch>(`/ariel/saved_searches/${search_id}`);
    
    // Start the search
    const searchResponse = await qradarClient.post<{ search_id: string }>('/ariel/searches', {
      query_expression: savedSearch.query_expression,
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
          ui_link: deeplinkBuilder.arielSearch(savedSearch.query_expression),
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
        ui_link: deeplinkBuilder.arielSearch(savedSearch.query_expression),
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
      ui_link: deeplinkBuilder.arielSearch(savedSearch.query_expression),
    };
  } catch (error) {
    console.error(`Error running saved search ${search_id}:`, error);
    throw error;
  }
}

// Made with Bob
