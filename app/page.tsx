import React from 'react';
import DashboardClient from '../components/DashboardClient';

export default function DashboardPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8">
            <DashboardClient />
        </div>
    );
}
