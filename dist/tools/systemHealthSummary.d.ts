import { z } from 'zod';
export declare const systemHealthSummaryInputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const systemHealthSummaryOutputSchema: z.ZodObject<{
    health: z.ZodAny;
    ui_link: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ui_link?: string | undefined;
    health?: any;
}, {
    ui_link?: string | undefined;
    health?: any;
}>;
export type SystemHealthSummaryInput = z.infer<typeof systemHealthSummaryInputSchema>;
export type SystemHealthSummaryOutput = z.infer<typeof systemHealthSummaryOutputSchema>;
/**
 * Get system health summary from QRadar
 */
export declare function systemHealthSummary(_input: SystemHealthSummaryInput): Promise<SystemHealthSummaryOutput>;
