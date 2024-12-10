import React from 'react';
import { Stock } from '@/db/types';
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Avatar } from "@nextui-org/avatar";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/spacer";
import DetailedStockChart, {
    DetailedStockChartLine
} from "@/app/stock/[stock_nyse]/components/DetailedChart";

interface StockInfoProps {
    stock: Stock;
}

export default function StockInfo({ stock }: StockInfoProps) {
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

            <Card>
                <DetailedStockChart
                    lines={chartLines}
                    width={600}
                    height={400}
                />
            </Card>
        </div>
    );
}
