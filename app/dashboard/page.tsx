import React from 'react';

export default function DashboardPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <h1 className="text-2xl font-semibold mb-6">Welcome to the dashboard!</h1>

            <div className="mt-8 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Stocks</h2>
            </div>
        </div>
    );
}