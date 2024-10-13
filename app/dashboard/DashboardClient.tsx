'use client';

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import Form from "./Form";
import NamesList from "./NamesList";
import SkeletonLoader from "./SkeletonLoader";

const DashboardClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const pageParam = searchParams.get('page');
        const page = pageParam && !isNaN(parseInt(pageParam)) && parseInt(pageParam) > 0 ? parseInt(pageParam) : 1;
        setCurrentPage(page);
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <h1 className="text-2xl font-semibold mb-6">Who are you?</h1>

            {/* Name Submission Form */}
            <Form />

            {/* List of Submitted Names */}
            <div className="mt-8 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Submitted Names</h2>
                <Suspense fallback={<SkeletonLoader />}>
                    <NamesList />
                </Suspense>
            </div>
        </div>
    );
};

export default DashboardClient;
