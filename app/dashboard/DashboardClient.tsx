import React, { Suspense } from "react";
import Form from "./Form";
import NamesList from "./NamesList";
import SkeletonLoader from "./SkeletonLoader";

const DashboardClient = () => {
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
