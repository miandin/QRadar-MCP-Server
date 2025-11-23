import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
// Input schema for get_offense tool
export const getOffenseInputSchema = z.object({
    offense_id: z.number().int().positive().describe('ID of the offense to retrieve'),
    fields: z.array(z.string()).optional().describe('Comma-separated list of fields to include in the response'),
});
// Output schema for get_offense tool
export const getOffenseOutputSchema = z.object({
    offense: z.any().describe('Offense details'),
    related: z.object({
        events_link: z.string().describe('Link to view events related to this offense'),
        flows_link: z.string().describe('Link to view flows related to this offense'),
    }).describe('Related links'),
    ui_link: z.string().describe('Link to the offense details page in QRadar UI'),
});
/**
 * Get a specific offense from QRadar
 */
export async function getOffense(input) {
    const { offense_id, fields } = input;
    // Build query parameters
    const params = {};
    // Add fields if provided
    if (fields && fields.length > 0) {
        params.fields = fields.join(',');
    }
    try {
        // Make API request
        const offense = await qradarClient.get(`/siem/offenses/${offense_id}`, params);
        // Generate UI links
        const uiLink = deeplinkBuilder.offenseDetails(offense_id);
        // Generate related links for events and flows
        const eventsLink = deeplinkBuilder.arielSearch(`SELECT * FROM events WHERE inOffense(${offense_id}) ORDER BY starttime DESC`);
        const flowsLink = deeplinkBuilder.arielSearch(`SELECT * FROM flows WHERE inOffense(${offense_id}) ORDER BY starttime DESC`);
        return {
            offense,
            related: {
                events_link: eventsLink,
                flows_link: flowsLink,
            },
            ui_link: uiLink,
        };
    }
    catch (error) {
        console.error(`Error getting offense ${offense_id}:`, error);
        throw error;
    }
}
// Made with Bob
//# sourceMappingURL=getOffense.js.map