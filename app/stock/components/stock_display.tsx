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
import {AsyncListData, useAsyncList} from '@react-stately/data';
import { Stock } from '@/db/types';
import { API_BASE_URL } from '@/app/api/route_helper';
import { APIResponsePaginated, APIResponsePaginatedSchema } from '@/db/helpers';
import { useRouter } from 'next/navigation';
import {Image} from "@nextui-org/image";
import {BsFillQuestionCircleFill} from "react-icons/bs";
import {Avatar} from "@nextui-org/avatar";
import MiniStockChart from "@/app/stock/components/mini-chart";

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

    return (
        <Table
            aria-label="Stock Table"
            isHeaderSticky
            baseRef={scrollerRef}
            bottomContent={
                hasMore ? (
                    <div className="flex w-full justify-center py-4">
                        <Spinner ref={loaderRef} color="primary"/>
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
                <TableColumn key="id" width={40} align='center'>ID</TableColumn>
                <TableColumn key="abbreviation" width={40} align='center'>Abbreviation</TableColumn>
                <TableColumn key='logo' width={76} align='center'>Logo</TableColumn>
                <TableColumn key="name" align='start' width={40}>Name</TableColumn>
                <TableColumn key="chart" align='center' width={120}>Price Chart</TableColumn>
                <TableColumn key="price" align='end'>Price</TableColumn>
                <TableColumn key="volume" align='end'>Volume</TableColumn>
            </TableHeader>
            <TableBody
                isLoading={isLoading}
                items={list.items}
                loadingContent={
                    <TableRow>
                        <TableCell colSpan={7} className="text-center">
                            <Spinner color="primary"/>
                        </TableCell>
                    </TableRow>
                }
            >
                {(stock: Stock) => (
                    <TableRow
                        key={stock.id}
                        onClick={() => handleRowClick(stock.abbreviation)}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <TableCell>{<p className='text-yellow-600'>{stock.id}</p>}</TableCell>
                        <TableCell>{stock.abbreviation}</TableCell>
                        <TableCell>
                            <Avatar
                                src={`https://img.logo.dev/ticker/${stock.abbreviation}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PUBLIC_API_KEY}&size=160`}
                                alt={stock.name}
                                showFallback
                                size='md'
                                radius='full'
                                fallback={<Spinner color='primary' className='scale-75'/>}
                            />
                        </TableCell>
                        <TableCell>{stock.name ?? 'N/A'}</TableCell>
                        <TableCell>
                            {/*<div className="w-full h-full">*/}
                            {/*    <Spinner color='warning'/>*/}
                            {/*</div>*/}
                            <MiniStockChart
                                width={120}
                                height={50}
                                lines={[{
                                    id: 'line1',
                                    data: [
                                        {date: '2023-01-01', close: Math.random()* 100}, {date: '2023-01-02', close: Math.random()* 100},
                                        {date: '2023-01-03', close: Math.random()* 100}, {date: '2023-01-04', close: Math.random()* 100},
                                        {date: '2023-01-05', close: Math.random()* 100}, {date: '2023-01-06', close: Math.random()* 100},
                                        {date: '2023-01-07', close: Math.random()* 100}, {date: '2023-01-08', close: Math.random()* 100},
                                        {date: '2023-01-09', close: Math.random()* 100}, {date: '2023-01-10', close: Math.random()* 100},
                                        {date: '2023-01-11', close: Math.random()* 100}, {date: '2023-01-12', close: Math.random()* 100},
                                    ],
                                    strokeColor: '#359bd8'
                                }
                            ]}
                            />
                        </TableCell>
                        <TableCell>{stock.price ?? 'N/A'}</TableCell>
                        <TableCell>{stock.volume ?? 'N/A'}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}