import { z } from 'zod';
export declare const runSavedSearchInputSchema: z.ZodObject<{
    search_id: z.ZodString;
    timeout_ms: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    search_id: string;
    timeout_ms: number;
}, {
    search_id: string;
    timeout_ms?: number | undefined;
}>;
export declare const runSavedSearchOutputSchema: z.ZodObject<{
    status: z.ZodString;
    rows: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    ui_link: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    ui_link?: string | undefined;
    rows?: any[] | undefined;
}, {
    status: string;
    ui_link?: string | undefined;
    rows?: any[] | undefined;
}>;
export type RunSavedSearchInput = z.infer<typeof runSavedSearchInputSchema>;
export type RunSavedSearchOutput = z.infer<typeof runSavedSearchOutputSchema>;
/**
 * Run a saved search in QRadar
 */
export declare function runSavedSearch(input: RunSavedSearchInput): Promise<RunSavedSearchOutput>;
