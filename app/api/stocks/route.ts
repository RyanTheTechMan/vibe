import { NextRequest } from 'next/server';
import { sql } from '@/db/db';
import {errorResponse, successResponse} from '@/db/helpers';

export const runtime = 'edge';

/* ----------------------- GET Handler ----------------------- */

export async function GET(request: NextRequest) {
    try {
        const result = await sql`
            SELECT id, abbreviation FROM stock;
        `;

        await new Promise(resolve => setTimeout(resolve, 1500));

        return successResponse(result, undefined, 200);
    } catch (error: any) {
        console.error('Error fetching Stock:', error);
        return errorResponse('Server error while fetching Events.', 500);
    }
}