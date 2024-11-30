import { NextRequest } from 'next/server';
import { sql } from '@/db/db';
import { errorResponse, successResponsePaginated } from '@/db/helpers';
import { z } from 'zod';
import {
    fetchLiveData,
    fetchTimeSeriesData,
    LiveData,
} from './cache';
import { StockSchema } from '@/db/types';

export const runtime = 'edge';

/* ----------------------- GET Handler ----------------------- */

export async function GET(request: NextRequest) {
    try {
        const filters = z.object({
            cursor: z.coerce.number().int().optional(),
        }).parse(Object.fromEntries(new URL(request.url).searchParams.entries()));

        const pageSize = 4; // Adjust as needed
        const start: number = isNaN(filters.cursor as number) ? 0 : (filters.cursor as number);

        // Fetch stock abbreviations and names
        const staticResult = await sql`
            SELECT id, abbreviation, name
            FROM stock
            ORDER BY id
            LIMIT ${pageSize} OFFSET ${start};
        `;

        if (staticResult.length === 0) {
            return successResponsePaginated([], null, undefined, 200);
        }

        const combinedResult = [];

        for (const stock of staticResult) {
            const liveData: LiveData | null = await fetchLiveData(stock.abbreviation);

            // Fetch cached time series data without forcing an update
            const timeSeriesData = await fetchTimeSeriesData(stock.abbreviation, '1day', 30);

            // Build the stock object conforming to StockSchema
            const stockData = {
                id: stock.id,
                abbreviation: stock.abbreviation,
                name: stock.name,
                price: liveData?.price,
                volume: liveData?.volume,
                open: liveData?.open,
                high: liveData?.high,
                low: liveData?.low,
                change: liveData?.change,
                percent_change: liveData?.percent_change,
                ...(timeSeriesData && { timeSeries: timeSeriesData }),
            };

            const validatedStockData = StockSchema.parse(stockData);

            combinedResult.push(validatedStockData);
        }

        const totalStocks = await getTotalStocks();
        const nextCursor: number | null = start + pageSize < totalStocks ? start + pageSize : null;

        return successResponsePaginated(combinedResult, nextCursor, undefined, 200);
    } catch (error: any) {
        console.error('Error fetching Stocks:', error);
        return errorResponse('Server error while fetching Stocks.', 500, error);
    }
}

async function getTotalStocks(): Promise<number> {
    const totalResult = await sql`SELECT COUNT(*) as count FROM stock;`;
    return parseInt(totalResult[0].count, 10);
}