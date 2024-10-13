'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { useRouter, useSearchParams } from 'next/navigation';
import SkeletonLoader from "./SkeletonLoader";
import { FaForward, FaBackward } from "react-icons/fa";

type Name = {
    id: number;
    name: string;
};

type Pagination = {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
};

type NamesResponse = {
    success: boolean;
    data: Name[];
    pagination: Pagination;
};

const NamesList = () => {
    const [names, setNames] = useState<Name[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('page');
    const parsedPage = parseInt(pageParam || '1', 10);
    const page = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/get-names?page=${page}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch names.');
                }
                const data: NamesResponse = await response.json();
                if (data.success) {
                    setNames(data.data);
                    setPagination(data.pagination);
                } else {
                    throw new Error('Failed to fetch names.');
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page]);

    const goToPage = (newPage: number) => {
        if (pagination) {
            const validPage = Math.min(Math.max(newPage, 1), pagination.totalPages);
            router.push(`/?page=${validPage}`);
        }
    };

    return (
        <div className="container mx-auto flex flex-col min-h-[37vh] p-4">
            {/* Main Content Area */}
            <div className="flex-grow">
                {loading && <SkeletonLoader />}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    <ul className="space-y-2">
                        {names.map((person) => (
                            <li key={person.id}>
                                <Card>
                                    <CardBody>
                                        <p>{person.name}</p>
                                    </CardBody>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && (
                <div className="flex items-center justify-between mt-4 py-4 border-t border-gray-200">
                    <Button
                        onClick={() => goToPage(pagination.currentPage - 1)}
                        isDisabled={pagination.currentPage === 1}
                        color="primary"
                        isIconOnly
                    >
                        <FaBackward />
                    </Button>

                    <span>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <Button
                        onClick={() => goToPage(pagination.currentPage + 1)}
                        isDisabled={pagination.currentPage === pagination.totalPages || loading}
                        color="primary"
                        isIconOnly
                    >
                        <FaForward />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default NamesList;