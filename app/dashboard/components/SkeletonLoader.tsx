import React from 'react';
import { Card } from "@nextui-org/card";
import { CardBody } from "@nextui-org/card";
import { Skeleton } from "@nextui-org/skeleton";

import { NAMES_PAGE_SIZE as PAGE_SIZE } from '../../../config/constants';

const SkeletonLoader = () => (
    <div className="space-y-2">
        {[...Array(PAGE_SIZE)].map((_, index) => (
            <Card key={index}>
                <CardBody>
                    <Skeleton className="h-6 w-3/4 rounded-lg bg-default-200"></Skeleton>
                </CardBody>
            </Card>
        ))}
    </div>
);

export default SkeletonLoader;