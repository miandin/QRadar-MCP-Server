import { z } from 'zod';
export declare const searchArielInputSchema: z.ZodObject<{
    aql: z.ZodString;
    timeout_ms: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    aql: string;
    timeout_ms: number;
}, {
    aql: string;
    timeout_ms?: number | undefined;
}>;
export declare const searchArielOutputSchema: z.ZodObject<{
    status: z.ZodEnum<["COMPLETED", "RUNNING", "FAILED"]>;
    rows: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    search_id: z.ZodOptional<z.ZodString>;
    ui_link: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "COMPLETED" | "RUNNING" | "FAILED";
    search_id?: string | undefined;
    ui_link?: string | undefined;
    rows?: any[] | undefined;
}, {
    status: "COMPLETED" | "RUNNING" | "FAILED";
    search_id?: string | undefined;
    ui_link?: string | undefined;
    rows?: any[] | undefined;
}>;
export type SearchArielInput = z.infer<typeof searchArielInputSchema>;
export type SearchArielOutput = z.infer<typeof searchArielOutputSchema>;
/**
 * Execute an Ariel search query
 */
export declare function searchAriel(input: SearchArielInput): Promise<SearchArielOutput>;
