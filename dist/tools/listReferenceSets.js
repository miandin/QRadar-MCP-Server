import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
// Input schema for list_reference_sets tool
export const listReferenceSetsInputSchema = z.object({
    name_contains: z.string().optional().describe('Filter by reference set name containing this string'),
    start: z.number().int().nonnegative().optional().describe('Starting index for pagination'),
    limit: z.number().int().positive().max(1000).optional().default(50).describe('Maximum number of items to return'),
});
// Output schema for list_reference_sets tool
export const listReferenceSetsOutputSchema = z.object({
    items: z.array(z.any()).describe('List of reference sets'),
    next_start: z.number().int().nonnegative().optional().describe('Starting index for the next page of results'),
    ui_link: z.string().optional().describe('Link to the reference sets page in QRadar UI'),
});
/**
 * List reference sets from QRadar
 */
export async function listReferenceSets(input) {
    const { name_contains, start = 0, limit = 50 } = input;
    // Build query parameters
    const params = {
        start,
        limit,
    };
    // Add filter if provided
    if (name_contains) {
        params.filter = `name ilike '%${name_contains}%'`;
    }
    try {
        // Make API request
        const referenceSets = await qradarClient.get('/reference_data/sets', params);
        // Generate UI link
        const uiLink = deeplinkBuilder.referenceSetsPage();
        // Determine if there are more results
        const nextStart = referenceSets.length === limit ? start + limit : undefined;
        return {
            items: referenceSets,
            next_start: nextStart,
            ui_link: uiLink,
        };
    }
    catch (error) {
        console.error('Error listing reference sets:', error);
        throw error;
    }
}
// Made with Bob
//# sourceMappingURL=listReferenceSets.js.map