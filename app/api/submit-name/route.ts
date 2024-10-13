import { NextResponse } from 'next/server';
import getPool from '../../lib/db'

export async function POST(request: Request) {
    const formData = await request.formData();
    const name = formData.get('name');

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
        // Redirect back with error status
        return NextResponse.redirect(new URL('/dashboard?status=error', request.url));
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 64) {
        // Redirect back with error status
        return NextResponse.redirect(new URL('/dashboard?status=error', request.url));
    }

    try {
        const pool = getPool();
        const [result] = await pool.execute('INSERT INTO ryan_testing (name) VALUES (?)', [trimmedName]);

        // Redirect back with success status
        return NextResponse.redirect(new URL('/dashboard?status=success', request.url));
    } catch (error) {
        console.error('Error inserting name:', error);
        // Redirect back with error status
        return NextResponse.redirect(new URL('/dashboard?status=error', request.url));
    }
}