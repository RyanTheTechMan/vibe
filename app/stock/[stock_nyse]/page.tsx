import React, { Suspense } from 'react';
import { Stock, StockSchema } from '@/db/types';
import { API_BASE_URL } from "@/app/api/route_helper";
import { APIResponse, APIResponseSchema } from "@/db/helpers";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Avatar } from "@nextui-org/avatar";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/spacer";
import DetailedStockChart, {
    DetailedStockChartLine,
    LineDataPoint
} from "@/app/stock/[stock_nyse]/components/DetailedChart";

export const runtime = 'edge';

export default function StockPage({ params }: { params: { stock_nyse: string } }) {
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
            throw new Error('Failed to parse stock data. ' + error?.message);
        }
    }

    const stock: Stock = React.use(fetchStockData(stock_nyse));

    // Prepare data for the detailed chart
    const chartLines: DetailedStockChartLine[] = [
        {
            id: `${stock.abbreviation}-close`,
            data: stock.timeSeries?.map(point => ({
                date: point.datetime.toISOString(),
                close: point.close,
            })),
            strokeColor: stock.percent_change! >= 0 ? '#359bd8' : '#e53e3e',
            strokeWidth: 2,
        }
    ];

    return (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Stock Info Card */}
            <Card>
                <CardHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h4>Stock Info</h4>
                    </div>
                    <Avatar
                        src={`https://img.logo.dev/ticker/${stock.abbreviation}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PUBLIC_API_KEY}&size=160`}
                        alt={stock.name}
                        isBordered
                        size='lg'
                        color="primary"
                        fallback={<Spinner color='primary' size="sm" />}
                    />
                </CardHeader>
                <CardBody>
                    <p><strong>Name:</strong> {stock.name}</p>
                    <p><strong>Symbol:</strong> {stock.abbreviation}</p>
                    <p><strong>ID:</strong> {stock.id}</p>
                    <p><strong>Price:</strong> ${stock.price?.toFixed(2)}</p>
                    <p><strong>Volume:</strong> {stock.volume?.toLocaleString()}</p>
                </CardBody>
            </Card>

            <Spacer y={1.5} />

            {/* Detailed Stock Chart Card */}
            <Card>
                <DetailedStockChart
                    lines={chartLines}
                    width={600}
                    height={400}
                />
            </Card>

            {/* You can add more Cards or sections below */}
        </div>
    );
}