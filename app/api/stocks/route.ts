import { NextRequest } from 'next/server';
import { sql } from '@/db/db';
import { errorResponse, successResponsePaginated } from '@/db/helpers';
import { z } from 'zod';
import {
    fetchLiveData,
    fetchTimeSeriesData,
    LiveData,
} from './cache';
import {Stock, StockSchema} from '@/db/types';

export const runtime = 'edge';

/* ----------------------- GET Handler ----------------------- */

export async function GET(request: NextRequest) {
    try {
        const filters = z.object({
            cursor: z.coerce.number().int().optional(),
        }).parse(Object.fromEntries(new URL(request.url).searchParams.entries()));

        const pageSize = 4; // Adjust as needed
        const start: number = isNaN(filters.cursor as number) ? 0 : (filters.cursor as number);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const endDate = new Date();

        const staticResult = await sql`
        SELECT
            id,
            abbreviation,
            name,
            GetStockSentimentScore(
                stock.id,
                ${startDate.toISOString()},
                ${endDate.toISOString()}
            ) AS sentiment_score,
            GetStockBiasScore(
                stock.id,
                ${startDate.toISOString()},
                ${endDate.toISOString()}
            ) AS bias_score
        FROM stock
        ORDER BY
            sentiment_score DESC NULLS LAST,
            bias_score ASC
        LIMIT ${pageSize}
        OFFSET ${start};
        `;

        if (staticResult.length === 0) {
            return successResponsePaginated([], null, undefined, 200);
        }

        const combinedResult = [];

        for (const stock of staticResult) {
            const liveData: LiveData | null = await fetchLiveData(stock.abbreviation);

            const timeSeriesData = await fetchTimeSeriesData(stock.abbreviation, '1day', 30);

            const stockData: Stock = {
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
                avg_sentiment: stock.sentiment_score,
                avg_bias: stock.bias_score,
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