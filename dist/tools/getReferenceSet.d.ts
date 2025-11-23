import { z } from 'zod';
export declare const getReferenceSetInputSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const getReferenceSetOutputSchema: z.ZodObject<{
    name: z.ZodString;
    data: z.ZodArray<z.ZodAny, "many">;
    ui_link: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    data: any[];
    ui_link?: string | undefined;
}, {
    name: string;
    data: any[];
    ui_link?: string | undefined;
}>;
export type GetReferenceSetInput = z.infer<typeof getReferenceSetInputSchema>;
export type GetReferenceSetOutput = z.infer<typeof getReferenceSetOutputSchema>;
/**
 * Get a specific reference set from QRadar
 */
export declare function getReferenceSet(input: GetReferenceSetInput): Promise<GetReferenceSetOutput>;
