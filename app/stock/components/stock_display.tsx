'use client';

import React, { useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell, SortDescriptor,
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
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";

export function StockTable() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [hasMore, setHasMore] = React.useState<boolean>(true);
    const [sort, setSort] = React.useState<'trending' | 'name' | 'id'>('id');
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "id",
        direction: "ascending",
    });

    const [pinnedStocks, setPinnedStocks] = React.useState<number[]>([]); // TODO: Fetch user's pinned stocks from the database

    const list: AsyncListData<Stock> = useAsyncList<Stock>({
        async load({ signal, cursor }) {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/stocks?cursor=${cursor ?? ''}&sort=${sort}&sortDirection=${sortDescriptor.direction}`,
                    { signal }
                );
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

    // Function to handle sort field change
    const handleSortChange = (value: string) => {
        setSort(value as 'trending' | 'name' | 'id');
    };

    // Function to toggle sort direction
    const toggleSortDirection = () => {
        setSortDescriptor(prev => ({
            column: prev.column,
            direction: prev.direction === 'ascending' ? 'descending' : 'ascending',
        }));
    };

    // Reload the list when sort or sort direction changes
    useEffect(() => {
        list.reload();
    }, [sort, sortDescriptor.direction]);

    useEffect(() => {
        console.log('Pinned Stocks updated:', pinnedStocks);
    }, [pinnedStocks]);


    return (
        <Table
            aria-label="Stock Table"
            isHeaderSticky
            baseRef={scrollerRef}
            sortDescriptor={sortDescriptor}
            topContent={
                <div className="flex items-center space-x-2">
                    <Popover placement="bottom-end">
                        <PopoverTrigger>
                            <Button
                                variant="light"
                                isIconOnly
                                aria-label="Sort Options"
                                size='lg'
                            >
                                {sortDescriptor.direction === 'ascending' ? <PiSortAscending className="text-xl" /> : <PiSortDescending className="text-xl" />}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="px-4 py-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-small font-bold">Sort By</span>
                                    <Button
                                        size="sm"
                                        onClick={toggleSortDirection}
                                        aria-label="Toggle Sort Direction"
                                    >
                                        {sortDescriptor.direction === 'ascending' ? <PiSortAscending /> : <PiSortDescending />}
                                    </Button>
                                </div>
                                <RadioGroup
                                    orientation="vertical"
                                    value={sort}
                                    onValueChange={handleSortChange}
                                >
                                    <Radio value="trending">Trending</Radio>
                                    <Radio value="name">Name</Radio>
                                    <Radio value="id">ID</Radio>
                                </RadioGroup>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            }
            topContentPlacement='outside'
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
                <TableColumn key='pin' width={40} align='center'>Pin</TableColumn>
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
                            <Spinner color="primary" />
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
                        <TableCell>
                            <Button
                                variant="light"
                                isIconOnly
                                aria-label="Pin Stock"
                                size='lg'
                                onPress={(e) => {
                                    setPinnedStocks((prevPinnedStocks) => {
                                        if (prevPinnedStocks.includes(stock.id)) {
                                            return prevPinnedStocks.filter(id => id !== stock.id);
                                        } else {
                                            return [...prevPinnedStocks, stock.id];
                                        }
                                    });
                                }}
                            >
                                {pinnedStocks.includes(stock.id) ? <BsPinAngleFill className="text-xl" /> : <BsPinAngle className="text-xl" />}
                            </Button>
                        </TableCell>
                        <TableCell>{<p className='text-yellow-600'>{stock.id}</p>}</TableCell>
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
                            <MiniStockChart
                                width={120}
                                height={50}
                                lines={[{
                                    id: 'line1',
                                    data: [
                                        { date: '2023-01-01', close: Math.random() * 100 },
                                        { date: '2023-01-02', close: Math.random() * 100 },
                                        { date: '2023-01-03', close: Math.random() * 100 },
                                        { date: '2023-01-04', close: Math.random() * 100 },
                                        { date: '2023-01-05', close: Math.random() * 100 },
                                        { date: '2023-01-06', close: Math.random() * 100 },
                                        { date: '2023-01-07', close: Math.random() * 100 },
                                        { date: '2023-01-08', close: Math.random() * 100 },
                                        { date: '2023-01-09', close: Math.random() * 100 },
                                        { date: '2023-01-10', close: Math.random() * 100 },
                                        { date: '2023-01-11', close: Math.random() * 100 },
                                        { date: '2023-01-12', close: Math.random() * 100 },
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