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
import {Stock, StockSchema} from '@/db/types';
import { API_BASE_URL } from '@/app/api/route_helper';
import { APIResponsePaginated, APIResponsePaginatedSchema } from '@/db/helpers';
import { useRouter } from 'next/navigation';
import { Avatar } from "@nextui-org/avatar";
import MiniStockChart from "@/app/stock/components/mini-chart";
import clsx from "clsx";
import {FaChevronDown, FaChevronRight, FaChevronUp, FaRegClock} from "react-icons/fa";
import {z} from "zod";

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
                const itemsFormatted: Stock[] = await z.array(StockSchema).parseAsync(data.content);
                return {
                    items: itemsFormatted,
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

    // Helper function to determine color and icon for % Change with more steps
    const getPercentChangeStyle = (percentChange: number) => {
        if (percentChange < -5) {
            return {
                color: 'text-red-700', // Very Negative
                Icon: FaChevronDown,
            };
        } else if (percentChange < -2) {
            return {
                color: 'text-red-500', // Negative
                Icon: FaChevronDown,
            };
        } else if (percentChange < 5) {
            return {
                color: 'text-green-500', // Positive
                Icon: FaChevronUp,
            };
        } else {
            return {
                color: 'text-green-500', // Very Positive
                Icon: FaChevronUp,
            };
        }
    };

// Helper function to determine color and icon for Sentiment with more steps
    const getSentimentStyle = (sentiment: number) => {
        if (sentiment < -0.6) {
            return {
                color: 'text-red-700', // Very Negative
                Icon: FaChevronDown,
            };
        } else if (sentiment < -0.1) {
            return {
                color: 'text-red-500', // Negative
                Icon: FaChevronDown,
            };
        } else if (sentiment < 0.1) {
            return {
                color: 'text-yellow-500', // Neutral
                Icon: FaChevronRight, // Indicating minimal sentiment
            };
        } else if (sentiment < 0.6) {
            return {
                color: 'text-green-500', // Positive
                Icon: FaChevronUp,
            };
        } else {
            return {
                color: 'text-green-700', // Very Positive
                Icon: FaChevronUp,
            };
        }
    };

// Helper function to determine color and icon for Bias with more steps
    const getBiasStyle = (bias: number) => {
        if (bias < 0.2) {
            return {
                color: 'text-green-700', // Very Low Bias
                Icon: FaChevronDown,
            };
        } else if (bias < 0.4) {
            return {
                color: 'text-green-500', // Low Bias
                Icon: FaChevronDown,
            };
        } else if (bias < 0.6) {
            return {
                color: 'text-yellow-700', // Moderate Bias
                Icon: FaChevronRight, // Indicating balanced bias
            };
        } else if (bias < 0.8) {
            return {
                color: 'text-orange-500', // High Bias
                Icon: FaChevronUp,
            };
        } else {
            return {
                color: 'text-red-700', // Very High Bias
                Icon: FaChevronUp,
            };
        }
    };

    // Helper function to render % Change
    const renderPercentChange = (percentChange: number | null | undefined) => {
        if (percentChange === null || percentChange === undefined) {
            return <Spinner color='primary' size='sm' />;
        }

        const { color, Icon } = getPercentChangeStyle(percentChange);

        return (
            <span className={clsx(color)} style={{ display: 'flex', alignItems: 'center' }}>
                <Icon />
                <span className="ml-1">{`${percentChange.toFixed(2)}%`}</span>
            </span>
        );
    };

    // Helper function to render Sentiment
    const renderSentiment = (sentiment: number | null | undefined) => {
        if (sentiment === null || sentiment === undefined) {
            return <Spinner color='primary' size='sm' />;
        }

        const { color, Icon } = getSentimentStyle(sentiment);
        const isPositive = sentiment >= 0;

        return (
            <span className={clsx(color)} style={{ display: 'flex', alignItems: 'center' }}>
                <Icon />
                <span className="ml-1">{sentiment.toFixed(2)}</span>
            </span>
        );
    };

    // Helper function to render Bias
    const renderBias = (bias: number | null | undefined) => {
        if (bias === null || bias === undefined) {
            return <Spinner color='primary' size='sm' />;
        }

        const { color, Icon } = getBiasStyle(bias);
        const isLowBias = bias < 0.5;

        return (
            <span className={clsx(color)} style={{ display: 'flex', alignItems: 'center' }}>
                <Icon />
                <span className="ml-1">{bias.toFixed(2)}</span>
            </span>
        );
    };

    const TimeAgo = ({ date }: { date: Date }): string => {
        let timeAgo: string;
        const diff = Date.now() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            timeAgo = `${days} day`;
        } else if (hours > 0) {
            timeAgo = `${hours} hour`;
        } else if (minutes > 0) {
            timeAgo = `${minutes} minute`;
        } else {
            timeAgo = `${seconds} second`;
        }

        if (days > 1 || hours > 1 || minutes > 1) {
            timeAgo += 's';
        }

        timeAgo += ' ago'

        return timeAgo;
    };

    // Helper function to format the last updated date
    const formatLastUpdated = (lastUpdated: Date | null | undefined) => {
        if (lastUpdated === null || lastUpdated === undefined) {
            return <Spinner color='primary' size='sm' />;
        }

        return (
            <span className="flex items-center space-x-1">
                <span className="text-gray-500 text-xs">
                    <FaRegClock />
                </span>
                <span className="text-gray-500 text-xs">
                    <TimeAgo date={lastUpdated} />
                </span>
            </span>
        );
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
                <TableColumn key="price" align='start'>Price</TableColumn>
                <TableColumn key="volume" align='start'>Volume</TableColumn>
                <TableColumn key="sentiment" align='start'>Sentiment</TableColumn>
                <TableColumn key="bias" align='start'>Bias</TableColumn>
                <TableColumn key="last_updated" align='start'>Last Updated</TableColumn>
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
                            {renderPercentChange(stock.percent_change)}
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
                            {renderSentiment(stock.avg_sentiment)}
                        </TableCell>
                        <TableCell>
                            {renderBias(stock.avg_bias)}
                        </TableCell>
                        <TableCell>
                            {formatLastUpdated((stock.last_updated_live ?? 0) > (stock.last_updated_time_series ?? 0) ? stock.last_updated_live : stock.last_updated_time_series)}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}