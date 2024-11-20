import { NextRequest } from 'next/server';
import { sql } from '@/db/db';
import {errorResponse, successResponsePaginated} from '@/db/helpers';
import { z } from 'zod';

export const runtime = 'edge';

const StockFiltersSchema = z.object({
    cursor: z.coerce.number().int().optional(),
});
type StockFilters = z.infer<typeof StockFiltersSchema>;

/* ----------------------- GET Handler ----------------------- */

export async function GET(request: NextRequest) {
    try {
        const filters: StockFilters = StockFiltersSchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));

        const pageSize = 10;
        let start: number = isNaN(filters.cursor as number) ? 0 : filters.cursor as number;

        const result = await sql`
            SELECT *
            FROM stock
            LIMIT ${pageSize} OFFSET ${start};
    `;

        const nextCursor: number | null = start + pageSize < (await getTotalStocks()) ? start + pageSize : null;

        // await new Promise(resolve => setTimeout(resolve, 500));

        return successResponsePaginated(result, nextCursor, undefined, 200);
    } catch (error: any) {
        console.error('Error fetching Stock:', error);
        return errorResponse('Server error while fetching Stocks.', 500, error);
    }
}

async function getTotalStocks(): Promise<number> {
    const totalResult = await sql`SELECT COUNT(*) as count FROM stock;`;
    return parseInt(totalResult[0].count, 10);
}