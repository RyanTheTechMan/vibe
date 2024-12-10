import React from 'react';
import { fetchStockData } from './components/fetchStockData';
import { Stock } from '@/db/types';
import StockInfo from './components/StockInfo';

export const runtime = 'edge';

interface PageProps {
    params: {
        stock_nyse: string;
    };
}

export default async function StockPage({ params }: PageProps) {
    const { stock_nyse } = params;

    // Await the data here, in the server component
    const stock: Stock = await fetchStockData(stock_nyse);

    // Pass the fetched data directly to StockInfo
    return <StockInfo stock={stock} />;
}
