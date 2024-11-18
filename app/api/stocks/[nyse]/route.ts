import { NextRequest } from 'next/server';
import { sql } from '@/db/db';
import {errorResponse, successResponse} from '@/db/helpers';

export const runtime = 'edge';

/* ----------------------- GET Handler ----------------------- */

export async function GET(request: NextRequest, { params }: { params: { nyse: string } }) {
    try {
        const stock_nyse_id = params.nyse.toUpperCase();

        const result = await sql`
            SELECT id, abbreviation FROM stock WHERE abbreviation = ${stock_nyse_id};
        `;

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (result.length === 0) return errorResponse('Stock not found.', 404);

        if (result.length > 1) return errorResponse('Multiple stocks found.', 400);

        return successResponse(result[0], undefined, 200);
    } catch (error: any) {
        console.error('Error fetching Stock:', error);
        return errorResponse('Server error while fetching Events.', 500);
    }
}