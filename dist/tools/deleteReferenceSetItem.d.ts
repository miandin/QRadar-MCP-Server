import { z } from 'zod';
export declare const deleteReferenceSetItemInputSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
}, "strip", z.ZodTypeAny, {
    value: string | number;
    name: string;
}, {
    value: string | number;
    name: string;
}>;
export declare const deleteReferenceSetItemOutputSchema: z.ZodObject<{
    deleted: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    deleted: boolean;
}, {
    deleted: boolean;
}>;
export type DeleteReferenceSetItemInput = z.infer<typeof deleteReferenceSetItemInputSchema>;
export type DeleteReferenceSetItemOutput = z.infer<typeof deleteReferenceSetItemOutputSchema>;
/**
 * Delete an item from a reference set
 */
export declare function deleteReferenceSetItem(input: DeleteReferenceSetItemInput): Promise<DeleteReferenceSetItemOutput>;
