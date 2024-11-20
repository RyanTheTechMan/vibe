import { z } from 'zod';

export const StockSchema = z.object({
    id: z.coerce.number().positive().int(),
    abbreviation: z.string().min(1).max(10).nullable(),
    name: z.string().min(1).max(100).optional(),
    price: z.coerce.number().int().optional(),
    volume: z.coerce.number().int().optional(),
});
export type Stock = z.infer<typeof StockSchema>;