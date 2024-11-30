import { NextRequest } from 'next/server';
import { sql } from '@/db/db';
import { errorResponse, successResponse } from '@/db/helpers';
import { z } from 'zod';
import {
    fetchLiveData,
    fetchTimeSeriesData,
    LiveData,
} from '../cache';
import { StockSchema } from '@/db/types';

export const runtime = 'edge';

/* ----------------------- GET Handler ----------------------- */

export async function GET(
    request: NextRequest,
    { params }: { params: { nyse: string } }
) {
    try {
        const parsedParams = z.object({
            nyse: z.string(),
        }).parse(params);
        const stock_nyse_id = parsedParams.nyse.toUpperCase();

        // Fetch stock information
        const result = await sql`
            SELECT id, abbreviation, name
            FROM stock
            WHERE abbreviation = ${stock_nyse_id}
            LIMIT 1;
        `;

        if (result.length === 0) {
            return errorResponse('Stock not found.', 404);
        }

        const stock = result[0];

        // Fetch live data
        const liveData: LiveData | null = await fetchLiveData(stock.abbreviation);

        // Fetch or update time series data (force update)
        const timeSeriesData = await fetchTimeSeriesData(stock.abbreviation, '1day', 30, true);

        // Prepare the response data
        const responseData: any = {
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

        // Validate responseData against StockSchema
        const validatedResponseData = StockSchema.parse(responseData);

        return successResponse(validatedResponseData, undefined, 200);
    } catch (error: any) {
        console.error('Error fetching Stock:', error);
        return errorResponse('Server error while fetching Stock.', 500, error);
    }
}