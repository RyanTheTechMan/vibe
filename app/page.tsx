import React from 'react';
import getPool from './lib/db'

import DashboardClient from '../components/DashboardClient';

type Name = {
    id: number;
    name: string;
};

async function fetchNames(): Promise<Name[]> {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, name FROM ryan_testing ORDER BY id DESC');
    return rows as Name[];
}

export default async function DashboardPage() {
    const names = await fetchNames();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8">
            <DashboardClient initialNames={names} />
        </div>
    );
}
