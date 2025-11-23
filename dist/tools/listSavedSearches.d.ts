import { z } from 'zod';
export declare const listSavedSearchesInputSchema: z.ZodObject<{
    type: z.ZodEnum<["EVENT", "FLOW"]>;
    start: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    type: "EVENT" | "FLOW";
    limit: number;
    start?: number | undefined;
}, {
    type: "EVENT" | "FLOW";
    start?: number | undefined;
    limit?: number | undefined;
}>;
export declare const listSavedSearchesOutputSchema: z.ZodObject<{
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
export type ListSavedSearchesInput = z.infer<typeof listSavedSearchesInputSchema>;
export type ListSavedSearchesOutput = z.infer<typeof listSavedSearchesOutputSchema>;
/**
 * List saved searches from QRadar
 */
export declare function listSavedSearches(input: ListSavedSearchesInput): Promise<ListSavedSearchesOutput>;
