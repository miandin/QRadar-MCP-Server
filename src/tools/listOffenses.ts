import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
import { Offense } from '../types/qradar.js';

// Input schema for list_offenses tool
export const listOffensesInputSchema = z.object({
  filter: z.string().optional().describe('Filter string to apply to offenses'),
  status: z.enum(['OPEN', 'CLOSED', 'HIDDEN']).optional().describe('Filter by offense status'),
  start: z.number().int().nonnegative().optional().describe('Starting index for pagination'),
  limit: z.number().int().positive().max(1000).optional().default(50).describe('Maximum number of items to return'),
  fields: z.array(z.string()).optional().describe('Comma-separated list of fields to include in the response'),
});

// Output schema for list_offenses tool
export const listOffensesOutputSchema = z.object({
  items: z.array(z.any()).describe('List of offenses'),
  next_start: z.number().int().nonnegative().optional().describe('Starting index for the next page of results'),
  ui_link: z.string().optional().describe('Link to the offenses page in QRadar UI'),
});

// Type definitions for input and output
export type ListOffensesInput = z.infer<typeof listOffensesInputSchema>;
export type ListOffensesOutput = z.infer<typeof listOffensesOutputSchema>;

/**
 * List offenses from QRadar
 */
export async function listOffenses(input: ListOffensesInput): Promise<ListOffensesOutput> {
  const { filter, status, start = 0, limit = 50, fields } = input;

  // Build query parameters
  const params: Record<string, string | number | boolean | undefined> = {
    start,
    limit,
  };

  // Add filter if provided
  if (filter) {
    params.filter = filter;
  }

  // Add status filter if provided
  if (status) {
    params.filter = params.filter 
      ? `${params.filter} AND status = '${status}'` 
      : `status = '${status}'`;
  }

  // Add fields if provided
  if (fields && fields.length > 0) {
    params.fields = fields.join(',');
  }

  try {
    // Make API request
    const offenses = await qradarClient.get<Offense[]>('/siem/offenses', params);

    // Ensure offenses is an array
    const offenseArray = Array.isArray(offenses) ? offenses : [];

    // Generate UI link
    const uiLink = deeplinkBuilder.offensesPage(filter);

    // Determine if there are more results
    const nextStart = offenseArray.length === limit ? start + limit : undefined;

    return {
      items: offenseArray,
      next_start: nextStart,
      ui_link: uiLink,
    };
  } catch (error) {
    console.error('Error listing offenses:', error);
    // Return empty result instead of throwing to maintain schema compliance
    return {
      items: [],
      next_start: undefined,
      ui_link: undefined,
    };
  }
}

// Made with Bob
