import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';
// Input schema for add_reference_set_item tool
export const addReferenceSetItemInputSchema = z.object({
    name: z.string().min(1).describe('Name of the reference set'),
    value: z.union([z.string(), z.number()]).describe('Value to add to the reference set'),
    source: z.string().optional().describe('Source of the reference set item'),
    time_to_live: z.string().optional().describe('Time to live for the reference set item (e.g., "1 month", "30 days")'),
});
// Output schema for add_reference_set_item tool
export const addReferenceSetItemOutputSchema = z.object({
    added: z.boolean().describe('Whether the item was successfully added'),
    item: z.any().optional().describe('The added reference set item'),
});
/**
 * Add an item to a reference set
 */
export async function addReferenceSetItem(input) {
    const { name, value, source, time_to_live } = input;
    // Build query parameters
    const params = {
        value,
    };
    if (source) {
        params.source = source;
    }
    if (time_to_live) {
        params.time_to_live = time_to_live;
    }
    try {
        // Make API request
        const response = await qradarClient.post(`/reference_data/sets/${encodeURIComponent(name)}`, undefined, { params });
        return {
            added: true,
            item: response,
        };
    }
    catch (error) {
        console.error(`Error adding item to reference set ${name}:`, error);
        throw error;
    }
}
// Made with Bob
//# sourceMappingURL=addReferenceSetItem.js.map