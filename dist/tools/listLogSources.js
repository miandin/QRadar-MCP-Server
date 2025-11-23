import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
// Input schema for list_log_sources tool
export const listLogSourcesInputSchema = z.object({
    type_id: z.number().int().positive().optional().describe('Filter by log source type ID'),
    name_contains: z.string().optional().describe('Filter by log source name containing this string'),
    start: z.number().int().nonnegative().optional().describe('Starting index for pagination'),
    limit: z.number().int().positive().max(1000).optional().default(50).describe('Maximum number of items to return'),
});
// Output schema for list_log_sources tool
export const listLogSourcesOutputSchema = z.object({
    items: z.array(z.any()).describe('List of log sources'),
    next_start: z.number().int().nonnegative().optional().describe('Starting index for the next page of results'),
    ui_link: z.string().optional().describe('Link to the log sources page in QRadar UI'),
});
/**
 * List log sources from QRadar
 */
export async function listLogSources(input) {
    const { type_id, name_contains, start = 0, limit = 50 } = input;
    // Build query parameters
    const params = {
        start,
        limit,
    };
    // Add filters if provided
    let filter = '';
    if (type_id) {
        filter = `type_id = ${type_id}`;
    }
    if (name_contains) {
        const nameFilter = `name ilike '%${name_contains}%'`;
        filter = filter ? `${filter} AND ${nameFilter}` : nameFilter;
    }
    if (filter) {
        params.filter = filter;
    }
    try {
        // Make API request
        const logSources = await qradarClient.get('/config/event_sources/log_source_management/log_sources', params);
        // Ensure we have an array
        const items = Array.isArray(logSources) ? logSources : [];
        // Generate UI link
        const uiLink = deeplinkBuilder.logSourcesPage();
        // Determine if there are more results
        const nextStart = items.length === limit ? start + limit : undefined;
        return {
            items,
            next_start: nextStart,
            ui_link: uiLink,
        };
    }
    catch (error) {
        console.error('Error listing log sources:', error);
        // Return empty array on error to satisfy schema
        return {
            items: [],
            ui_link: deeplinkBuilder.logSourcesPage(),
        };
    }
}
// Made with Bob
//# sourceMappingURL=listLogSources.js.map