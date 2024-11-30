// stock_display.tsx

'use client';

import React from 'react';
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from '@nextui-org/table';
import { Spinner } from '@nextui-org/spinner';
import { useInfiniteScroll } from '@nextui-org/use-infinite-scroll';
import { AsyncListData, useAsyncList } from '@react-stately/data';
import { Stock } from '@/db/types';
import { API_BASE_URL } from '@/app/api/route_helper';
import { APIResponsePaginated, APIResponsePaginatedSchema } from '@/db/helpers';
import { useRouter } from 'next/navigation';
import { Avatar } from "@nextui-org/avatar";
import MiniStockChart from "@/app/stock/components/mini-chart";
import clsx from "clsx";
import {FaChevronDown, FaChevronUp} from "react-icons/fa";

export function StockTable() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [hasMore, setHasMore] = React.useState<boolean>(true);

    const list: AsyncListData<Stock> = useAsyncList<Stock>({
        async load({ signal, cursor }) {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/stocks?cursor=${cursor ?? ''}`, { signal });
                if (!response.ok) throw new Error('Failed to load stocks');
                const data: APIResponsePaginated = await APIResponsePaginatedSchema.parseAsync(await response.json());

                setHasMore(data.nextCursor !== null);

                return {
                    items: data.content,
                    cursor: data.nextCursor?.toString(),
                };
            } catch (error) {
                console.error('Error fetching stocks:', error);
                return { items: [], cursor: undefined };
            } finally {
                setIsLoading(false);
            }
        },
    });

    const [loaderRef, scrollerRef] = useInfiniteScroll({
        hasMore,
        onLoadMore: list.loadMore,
    });

    const handleRowClick = (stockAbbr: string | null) => {
        if (stockAbbr) {
            router.push(`/stock/${stockAbbr}`);
        }
    };

    // Helper functions for formatting
    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    const formatVolume = (volume: number) => {
        return volume.toLocaleString();
    };

    return (
        <Table
            aria-label="Stock Table"
            isHeaderSticky
            baseRef={scrollerRef}
            bottomContent={
                hasMore ? (
                    <div className="flex w-full justify-center py-4">
                        <Spinner ref={loaderRef} color="primary" />
                    </div>
                ) : (
                    <div className="flex w-full justify-center py-4">
                        <span>No more stocks to load.</span>
                    </div>
                )
            }
            classNames={{
                base: 'max-h-[500px] overflow-auto',
                table: 'min-w-full',
            }}
        >
            <TableHeader>
                {/*<TableColumn key="id" width={40} align='center'>ID</TableColumn>*/}
                <TableColumn key="abbreviation" width={40} align='center'>Abbreviation</TableColumn>
                <TableColumn key='logo' width={76} align='center'>Logo</TableColumn>
                <TableColumn key="name" align='start' width={40}>Name</TableColumn>
                <TableColumn key="percent_change" align='start' width={40}>% Change</TableColumn>
                <TableColumn key="chart" align='center' width={120}>Price Chart (30d)</TableColumn>
                <TableColumn key="price" align='end'>Price</TableColumn>
                <TableColumn key="volume" align='end'>Volume</TableColumn>
                <TableColumn key="open" align='end'>Open</TableColumn>
                <TableColumn key="high" align='end'>High</TableColumn>
                <TableColumn key="low" align='end'>Low</TableColumn>
                <TableColumn key="change" align='end'>Change</TableColumn>
            </TableHeader>
            <TableBody
                isLoading={isLoading}
                items={list.items}
                loadingContent={
                    <TableRow>
                        <TableCell colSpan={12} className="text-center">
                            <Spinner color="primary" />
                        </TableCell>
                    </TableRow>
                }
            >
                {(stock: Stock) => (
                    <TableRow
                        key={stock.id}
                        onClick={() => handleRowClick(stock.abbreviation || '')}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {/*<TableCell>*/}
                        {/*    <p className='text-yellow-600'>{stock.id}</p>*/}
                        {/*</TableCell>*/}
                        <TableCell>{stock.abbreviation}</TableCell>
                        <TableCell>
                            <Avatar
                                src={`https://img.logo.dev/ticker/${stock.abbreviation}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PUBLIC_API_KEY}&size=160`}
                                alt={stock.name}
                                showFallback
                                size='md'
                                radius='full'
                                fallback={<Spinner color='primary' className='scale-75' />}
                            />
                        </TableCell>
                        <TableCell>{stock.name ?? 'N/A'}</TableCell>
                        <TableCell>
                            {stock.percent_change !== null && stock.percent_change !== undefined ? (
                                <span className={clsx(stock.percent_change >= 0 ? 'text-green-500' : 'text-red-500')} style={{ display: 'flex', alignItems: 'center' }}>
                                    {stock.percent_change >= 0 ? <FaChevronUp /> : <FaChevronDown />}
                                    <span className="ml-1">{`${stock.percent_change.toFixed(2)}%`}</span>
                                </span>
                            ) : (
                                <Spinner color='primary' size='sm' />
                            )}
                        </TableCell>
                        <TableCell>
                            {stock.timeSeries && stock.timeSeries.length > 0 ? (
                                <MiniStockChart
                                    width={120}
                                    height={50}
                                    lines={[{
                                        id: stock.abbreviation || 'line1',
                                        data: stock.timeSeries.map(point => ({
                                            date: new Date(point.datetime).toISOString(), // Convert Date to ISO string
                                            close: point.close,
                                        })),
                                        strokeColor: stock.percent_change! >= 0 ? '#359bd8' : '#e53e3e',
                                    }]}
                                />
                            ) : (
                                <div className="text-gray-500 text-xs">No chart data</div>
                            )}
                        </TableCell>
                        <TableCell>
                            {stock.price !== null && stock.price !== undefined
                                ? formatPrice(stock.price)
                                : <Spinner color='primary' size='sm' />}
                        </TableCell>
                        <TableCell>
                            {stock.volume !== null && stock.volume !== undefined
                                ? formatVolume(stock.volume)
                                : <Spinner color='primary' size='sm' />}
                        </TableCell>
                        <TableCell>
                            {stock.open !== null && stock.open !== undefined
                                ? formatPrice(stock.open)
                                : <Spinner color='primary' size='sm' />}
                        </TableCell>
                        <TableCell>
                            {stock.high !== null && stock.high !== undefined
                                ? formatPrice(stock.high)
                                : <Spinner color='primary' size='sm' />}
                        </TableCell>
                        <TableCell>
                            {stock.low !== null && stock.low !== undefined
                                ? formatPrice(stock.low)
                                : <Spinner color='primary' size='sm' />}
                        </TableCell>
                        <TableCell>
                            {stock.change !== null && stock.change !== undefined
                                ? formatPrice(stock.change)
                                : <Spinner color='primary' size='sm' />}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}