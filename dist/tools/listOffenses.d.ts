import { z } from 'zod';
export declare const listOffensesInputSchema: z.ZodObject<{
    filter: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["OPEN", "CLOSED", "HIDDEN"]>>;
    start: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "OPEN" | "CLOSED" | "HIDDEN" | undefined;
    filter?: string | undefined;
    start?: number | undefined;
    fields?: string[] | undefined;
}, {
    status?: "OPEN" | "CLOSED" | "HIDDEN" | undefined;
    filter?: string | undefined;
    start?: number | undefined;
    limit?: number | undefined;
    fields?: string[] | undefined;
}>;
export declare const listOffensesOutputSchema: z.ZodObject<{
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
export type ListOffensesInput = z.infer<typeof listOffensesInputSchema>;
export type ListOffensesOutput = z.infer<typeof listOffensesOutputSchema>;
/**
 * List offenses from QRadar
 */
export declare function listOffenses(input: ListOffensesInput): Promise<ListOffensesOutput>;
