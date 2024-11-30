import { z } from 'zod';

export const TimeSeriesSchema = z.object({
    datetime: z.coerce.date(),
    open: z.coerce.number(),
    high: z.coerce.number(),
    low: z.coerce.number(),
    close: z.coerce.number(),
});

export const StockSchema = z.object({
    id: z.coerce.number().positive().int(),
    abbreviation: z.string().min(1).max(10).nullable(),
    name: z.string().min(1).max(100).optional(),
    price: z.coerce.number().optional(),
    volume: z.coerce.number().optional(),
    open: z.coerce.number().optional(),
    high: z.coerce.number().optional(),
    low: z.coerce.number().optional(),
    change: z.coerce.number().optional(),
    percent_change: z.coerce.number().optional(),
    timeSeries: z.array(TimeSeriesSchema).nullable().optional(),
});
export type Stock = z.infer<typeof StockSchema>;