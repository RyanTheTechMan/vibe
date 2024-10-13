import { NextResponse } from 'next/server';
import getPool from '../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

import { NAMES_PAGE_SIZE as PAGE_SIZE } from '../../../config/constants';

type Name = RowDataPacket & {
    id: number;
    name: string;
};

type CountResult = RowDataPacket & {
    count: number;
};

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const pageParam = url.searchParams.get('page');
        const parsedPage = parseInt(pageParam || '1');

        const page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

        const offset = (page - 1) * PAGE_SIZE;

        const pool = getPool();

        const [rows] = await pool.query<Name[]>(
            'SELECT id, name FROM ryan_testing ORDER BY id DESC LIMIT ? OFFSET ?',
            [PAGE_SIZE, offset]
        );

        const [countRows] = await pool.query<CountResult[]>('SELECT COUNT(*) as count FROM ryan_testing');

        const totalCount = countRows[0]?.count ?? 0;
        const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

        // Adjust the page if it exceeds totalPages
        const validPage = page > totalPages ? totalPages : page;

        // If the page was adjusted, refetch the data
        if (validPage !== page) {
            const adjustedOffset = (validPage - 1) * PAGE_SIZE;
            const [adjustedRows] = await pool.query<Name[]>(
                'SELECT id, name FROM ryan_testing ORDER BY id DESC LIMIT ? OFFSET ?',
                [PAGE_SIZE, adjustedOffset]
            );

            return NextResponse.json({
                success: true,
                data: adjustedRows,
                pagination: {
                    currentPage: validPage,
                    totalPages,
                    pageSize: PAGE_SIZE,
                    totalCount,
                },
            }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            data: rows,
            pagination: {
                currentPage: validPage,
                totalPages,
                pageSize: PAGE_SIZE,
                totalCount,
            },
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching names:', error);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}
