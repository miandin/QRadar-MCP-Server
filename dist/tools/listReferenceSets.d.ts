import { z } from 'zod';
export declare const listReferenceSetsInputSchema: z.ZodObject<{
    name_contains: z.ZodOptional<z.ZodString>;
    start: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    start?: number | undefined;
    name_contains?: string | undefined;
}, {
    start?: number | undefined;
    limit?: number | undefined;
    name_contains?: string | undefined;
}>;
export declare const listReferenceSetsOutputSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodAny, "many">;
    next_start: z.ZodOptional<z.ZodNumber>;
    ui_link: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: any[];
    next_start?: number | undefined;
    ui_link?: string | undefined;
}, {
    items: any[];
    next_start?: number | undefined;
    ui_link?: string | undefined;
}>;
export type ListReferenceSetsInput = z.infer<typeof listReferenceSetsInputSchema>;
export type ListReferenceSetsOutput = z.infer<typeof listReferenceSetsOutputSchema>;
/**
 * List reference sets from QRadar
 */
export declare function listReferenceSets(input: ListReferenceSetsInput): Promise<ListReferenceSetsOutput>;
