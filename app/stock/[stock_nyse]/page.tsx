import React, { Suspense } from 'react';
import { Stock, StockSchema } from '@/db/types';

function StockInfo({ stock_nyse }: { stock_nyse: string }) {
    async function fetchStockData(stock_nyse: string): Promise<Stock> {
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/stocks/${stock_nyse}`);
        if (!response.ok) throw new Error('Failed to fetch stock data');

        try {
            const json = await response.json();
            if (!json.success) throw new Error('Failed to parse stock data. JSON response error.');
            return await StockSchema.parseAsync(json.data);
        } catch (error: any) {
            console.error(error);
            throw new Error('Failed to parse stock data.' + error?.message);
        }
    }

    const stockData: Stock = React.use(fetchStockData(stock_nyse));

    return (
        <div>
            <h1>Stock Info</h1>
            <p>Symbol: {stockData.abbreviation}</p>
            <p>ID: {stockData.id}</p>
        </div>
    );
}

export default function Page({ params }: { params: { stock_nyse: string } }) {
    const { stock_nyse } = params;

    return (
        <Suspense fallback={<div>Loading stock data...</div>}>
            <StockInfo stock_nyse={stock_nyse} />
        </Suspense>
    );
}
