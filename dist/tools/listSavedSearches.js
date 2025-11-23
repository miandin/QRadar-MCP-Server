import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
// Input schema for list_saved_searches tool
export const listSavedSearchesInputSchema = z.object({
    type: z.enum(['EVENT', 'FLOW']).describe('Type of saved searches to list'),
    start: z.number().int().nonnegative().optional().describe('Starting index for pagination'),
    limit: z.number().int().positive().max(1000).optional().default(50).describe('Maximum number of items to return'),
});
// Output schema for list_saved_searches tool
export const listSavedSearchesOutputSchema = z.object({
    items: z.array(z.any()).describe('List of saved searches'),
    next_start: z.number().int().nonnegative().optional().describe('Starting index for the next page of results'),
    ui_link: z.string().optional().describe('Link to the saved searches page in QRadar UI'),
});
/**
 * List saved searches from QRadar
 */
export async function listSavedSearches(input) {
    const { type, start = 0, limit = 50 } = input;
    // Build query parameters
    const params = {
        start,
        limit,
    };
    // Add filter for search type
    params.filter = `database=${type === 'EVENT' ? 'EVENTS' : 'FLOWS'}`;
    try {
        // Make API request
        const savedSearches = await qradarClient.get('/ariel/saved_searches', params);
        // Generate UI link
        const uiLink = deeplinkBuilder.savedSearchesPage(type);
        // Determine if there are more results
        const nextStart = savedSearches.length === limit ? start + limit : undefined;
        return {
            items: savedSearches,
            next_start: nextStart,
            ui_link: uiLink,
        };
    }
    catch (error) {
        console.error('Error listing saved searches:', error);
        throw error;
    }
}
// Made with Bob
//# sourceMappingURL=listSavedSearches.js.map