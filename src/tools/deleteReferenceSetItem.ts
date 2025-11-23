import { z } from 'zod';
import { qradarClient } from '../utils/qradarClient.js';

// Input schema for delete_reference_set_item tool
export const deleteReferenceSetItemInputSchema = z.object({
  name: z.string().min(1).describe('Name of the reference set'),
  value: z.union([z.string(), z.number()]).describe('Value to delete from the reference set'),
});

// Output schema for delete_reference_set_item tool
export const deleteReferenceSetItemOutputSchema = z.object({
  deleted: z.boolean().describe('Whether the item was successfully deleted'),
});

// Type definitions for input and output
export type DeleteReferenceSetItemInput = z.infer<typeof deleteReferenceSetItemInputSchema>;
export type DeleteReferenceSetItemOutput = z.infer<typeof deleteReferenceSetItemOutputSchema>;

/**
 * Delete an item from a reference set
 */
export async function deleteReferenceSetItem(input: DeleteReferenceSetItemInput): Promise<DeleteReferenceSetItemOutput> {
  const { name, value } = input;

  try {
    // Make API request
    await qradarClient.delete(
      `/reference_data/sets/${encodeURIComponent(name)}/${encodeURIComponent(String(value))}`
    );

    return {
      deleted: true,
    };
  } catch (error) {
    console.error(`Error deleting item from reference set ${name}:`, error);
    throw error;
  }
}

// Made with Bob
