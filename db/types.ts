import { z } from 'zod';

export const StockSchema = z.object({
    id: z.coerce.number().positive().int(),
    abbreviation: z.string().min(3).max(10),
});
export type Stock = z.infer<typeof StockSchema>;