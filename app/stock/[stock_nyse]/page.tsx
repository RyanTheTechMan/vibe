import React, { Suspense } from 'react';
import { Stock, StockSchema } from '@/db/types';
import { API_BASE_URL } from "@/app/api/route_helper";
import { APIResponse, APIResponseSchema } from "@/db/helpers";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {Avatar} from "@nextui-org/avatar";
import {Spinner} from "@nextui-org/spinner";

export const runtime = 'edge';

export default function StockPage ({ params }: { params: { stock_nyse: string } }) {
    const { stock_nyse } = params;

    return (
        <Suspense fallback={<div>Loading stock data...</div>}>
            <StockInfo stock_nyse={stock_nyse} />
        </Suspense>
    );
}

function StockInfo({ stock_nyse }: { stock_nyse: string }) {
    async function fetchStockData(stock_nyse: string): Promise<Stock> {
        try {
            const response = await fetch(API_BASE_URL + `/stocks/${stock_nyse}`);
            if (!response.ok) throw new Error('Failed to fetch stock data');
            const data: APIResponse = await APIResponseSchema.parseAsync(await response.json());

            return await StockSchema.parseAsync(data.content);
        } catch (error: any) {
            console.error(error);
            throw new Error('Failed to parse stock data.' + error?.message);
        }
    }

    const stock: Stock = React.use(fetchStockData(stock_nyse));

    return (
        <Card>
            <CardHeader>
                Stock Info
                <Avatar
                    src={`https://img.logo.dev/ticker/${stock.abbreviation}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PUBLIC_API_KEY}&size=160`}
                    alt={stock.name}
                    showFallback
                    size='md'
                    radius='full'
                    fallback={<Spinner color='primary' className='scale-75'/>}
                />
            </CardHeader>
            <CardBody>
                <p>Name: {stock.name}</p>
                <p>Symbol: {stock.abbreviation}</p>
                <p>ID: {stock.id}</p>
            </CardBody>
        </Card>
    );
}