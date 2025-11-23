import { z } from 'zod';
export declare const listLogSourcesInputSchema: z.ZodObject<{
    type_id: z.ZodOptional<z.ZodNumber>;
    name_contains: z.ZodOptional<z.ZodString>;
    start: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    type_id?: number | undefined;
    start?: number | undefined;
    name_contains?: string | undefined;
}, {
    type_id?: number | undefined;
    start?: number | undefined;
    limit?: number | undefined;
    name_contains?: string | undefined;
}>;
export declare const listLogSourcesOutputSchema: z.ZodObject<{
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
export type ListLogSourcesInput = z.infer<typeof listLogSourcesInputSchema>;
export type ListLogSourcesOutput = z.infer<typeof listLogSourcesOutputSchema>;
/**
 * List log sources from QRadar
 */
export declare function listLogSources(input: ListLogSourcesInput): Promise<ListLogSourcesOutput>;
