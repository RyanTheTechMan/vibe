import { NextResponse } from 'next/server';
import getPool from '../../lib/db';

export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        // Server-side validation
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ success: false, message: 'Invalid name.' }, { status: 400 });
        }

        const trimmedName = name.trim();

        if (trimmedName.length > 64) {
            return NextResponse.json({ success: false, message: 'Name too long.' }, { status: 400 });
        }

        const pool = getPool();
        const [result] = await pool.execute('INSERT INTO ryan_testing (name) VALUES (?)', [trimmedName]);

        return NextResponse.json({ success: true, message: 'Name submitted successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error inserting name:', error);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}
