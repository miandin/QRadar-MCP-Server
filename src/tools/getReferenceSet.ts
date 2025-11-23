import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
import { ReferenceSetItem } from '../types/qradar.js';

// Input schema for get_reference_set tool
export const getReferenceSetInputSchema = z.object({
  name: z.string().min(1).describe('Name of the reference set to retrieve'),
});

// Output schema for get_reference_set tool
export const getReferenceSetOutputSchema = z.object({
  name: z.string().describe('Name of the reference set'),
  data: z.array(z.any()).describe('Reference set items'),
  ui_link: z.string().optional().describe('Link to the reference set in QRadar UI'),
});

// Type definitions for input and output
export type GetReferenceSetInput = z.infer<typeof getReferenceSetInputSchema>;
export type GetReferenceSetOutput = z.infer<typeof getReferenceSetOutputSchema>;

/**
 * Get a specific reference set from QRadar
 */
export async function getReferenceSet(input: GetReferenceSetInput): Promise<GetReferenceSetOutput> {
  const { name } = input;

  try {
    // Make API request
    const referenceSetItems = await qradarClient.get<ReferenceSetItem[]>(`/reference_data/sets/${encodeURIComponent(name)}`);

    // Generate UI link
    const uiLink = deeplinkBuilder.referenceSetDetails(name);

    return {
      name,
      data: referenceSetItems,
      ui_link: uiLink,
    };
  } catch (error) {
    console.error(`Error getting reference set ${name}:`, error);
    throw error;
  }
}

// Made with Bob
