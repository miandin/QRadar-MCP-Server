import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
import { deeplinkBuilder } from '../utils/deeplinks.js';
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
/**
 * Get a specific reference set from QRadar
 */
export async function getReferenceSet(input) {
    const { name } = input;
    try {
        // Make API request
        const referenceSetItems = await qradarClient.get(`/reference_data/sets/${encodeURIComponent(name)}`);
        // Generate UI link
        const uiLink = deeplinkBuilder.referenceSetDetails(name);
        return {
            name,
            data: referenceSetItems,
            ui_link: uiLink,
        };
    }
    catch (error) {
        console.error(`Error getting reference set ${name}:`, error);
        throw error;
    }
}
// Made with Bob
//# sourceMappingURL=getReferenceSet.js.map