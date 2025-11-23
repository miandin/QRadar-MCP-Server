import { z } from 'zod';
export declare const getOffenseInputSchema: z.ZodObject<{
    offense_id: z.ZodNumber;
    fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    offense_id: number;
    fields?: string[] | undefined;
}, {
    offense_id: number;
    fields?: string[] | undefined;
}>;
export declare const getOffenseOutputSchema: z.ZodObject<{
    offense: z.ZodAny;
    related: z.ZodObject<{
        events_link: z.ZodString;
        flows_link: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        events_link: string;
        flows_link: string;
    }, {
        events_link: string;
        flows_link: string;
    }>;
    ui_link: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ui_link: string;
    related: {
        events_link: string;
        flows_link: string;
    };
    offense?: any;
}, {
    ui_link: string;
    related: {
        events_link: string;
        flows_link: string;
    };
    offense?: any;
}>;
export type GetOffenseInput = z.infer<typeof getOffenseInputSchema>;
export type GetOffenseOutput = z.infer<typeof getOffenseOutputSchema>;
/**
 * Get a specific offense from QRadar
 */
export declare function getOffense(input: GetOffenseInput): Promise<GetOffenseOutput>;
