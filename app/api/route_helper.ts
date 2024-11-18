const isServer = typeof window === 'undefined';

if (!process.env.NEXT_PUBLIC_API_BASE_URL)
    throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set.');

if (isServer)
    if (!process.env.CF_PAGES_URL)
        throw new Error('CF_PAGES_URL environment variable is not set.');

export const API_BASE_URL = isServer ? (process.env.CF_PAGES_URL + process.env.NEXT_PUBLIC_API_BASE_URL) : process.env.NEXT_PUBLIC_API_BASE_URL;