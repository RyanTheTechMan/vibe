import { NextResponse } from 'next/server';
import getPool from '../../lib/db';

type Name = {
    id: number;
    name: string;
};

export async function GET() {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT id, name FROM ryan_testing ORDER BY id DESC');
        const names = rows as Name[];
        return NextResponse.json({ success: true, data: names }, { status: 200 });
    } catch (error) {
        console.error('Error fetching names:', error);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}
