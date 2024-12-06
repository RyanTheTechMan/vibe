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
    price: z.coerce.number().nullable().optional(),
    volume: z.coerce.number().nullable().optional(),
    open: z.coerce.number().nullable().optional(),
    high: z.coerce.number().nullable().optional(),
    low: z.coerce.number().nullable().optional(),
    change: z.coerce.number().nullable().optional(),
    percent_change: z.coerce.number().nullable().optional(),
    timeSeries: z.array(TimeSeriesSchema).nullable().optional(),
    avg_sentiment: z.coerce.number().nullable().optional(),
    avg_bias: z.coerce.number().nullable().optional(),
    last_updated_live: z.coerce.date().nullable().optional(),
    last_updated_time_series: z.coerce.date().nullable().optional(),
});
export type Stock = z.infer<typeof StockSchema>;