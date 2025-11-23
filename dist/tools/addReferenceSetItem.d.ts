import { z } from 'zod';
export declare const addReferenceSetItemInputSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    source: z.ZodOptional<z.ZodString>;
    time_to_live: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string | number;
    name: string;
    time_to_live?: string | undefined;
    source?: string | undefined;
}, {
    value: string | number;
    name: string;
    time_to_live?: string | undefined;
    source?: string | undefined;
}>;
export declare const addReferenceSetItemOutputSchema: z.ZodObject<{
    added: z.ZodBoolean;
    item: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    added: boolean;
    item?: any;
}, {
    added: boolean;
    item?: any;
}>;
export type AddReferenceSetItemInput = z.infer<typeof addReferenceSetItemInputSchema>;
export type AddReferenceSetItemOutput = z.infer<typeof addReferenceSetItemOutputSchema>;
/**
 * Add an item to a reference set
 */
export declare function addReferenceSetItem(input: AddReferenceSetItemInput): Promise<AddReferenceSetItemOutput>;
