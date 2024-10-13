'use client';


import React from 'react';

const SuccessErrorMessage = ({
                                 type,
                                 message,
                             }: {
    type: 'success' | 'error';
    message: string;
}) => {
    const color = type === 'success' ? 'success' : 'error';

    return (
        <p className="mt-4 text-center">{message}</p>
    );
};

export default SuccessErrorMessage;
