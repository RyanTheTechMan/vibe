import { NextRequest } from 'next/server';
import { sql } from '@/db/db';
import { errorResponse, successResponsePaginated } from '@/db/helpers';
import { z } from 'zod';

export const runtime = 'edge';

const StockFiltersSchema = z.object({
    cursor: z.coerce.number().int().optional(),
    sort: z.enum(['trending', 'name', 'id']).default('id'),
    sortDirection: z.enum(['ascending', 'descending']).default('descending'),
});
type StockFilters = z.infer<typeof StockFiltersSchema>;

/* ----------------------- GET Handler ----------------------- */

export async function GET(request: NextRequest) {
    try {
        const filters: StockFilters = StockFiltersSchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));

        const pageSize = 10;
        let start: number = isNaN(filters.cursor as number) ? 0 : filters.cursor as number;

        const orderBy = {
            'trending': 'volume',
            'name': 'name',
            'id': 'id',
        }[filters.sort];

        let result;

        if (filters.sortDirection === 'ascending') {
            result = await sql`
                SELECT *
                FROM stock
                ORDER BY ${orderBy} ASC
                LIMIT ${pageSize} OFFSET ${start}
            `;
        }
        else {
            result = await sql`
                SELECT *
                FROM stock
                ORDER BY ${orderBy} DESC
                LIMIT ${pageSize} OFFSET ${start}
            `;
        }

        const nextCursor: number | null = start + pageSize < (await getTotalStocks()) ? start + pageSize : null;

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