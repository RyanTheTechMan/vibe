import { sql } from '@/db/db';
import { z } from 'zod';
import { TimeSeriesSchema } from '@/db/types';

const TWELVEDATA_BASE_URL = 'https://api.twelvedata.com';
const TWELVEDATA_API_KEY = process.env.TWELVEDATA_API_KEY;

export const cacheDuration = 2 * 60 * 60 * 1000;

export interface LiveData {
    price: number | null;
    volume: number | null;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    change?: number | null;
    percent_change?: number | null;
    name?: string | null;
}

export interface TimeSeriesDataPoint {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}

export interface TimeSeriesResponse {
    meta: {
        symbol: string;
        interval: string;
        currency: string;
        exchange_timezone: string;
        exchange: string;
        mic_code: string;
        type: string;
    };
    values: TimeSeriesDataPoint[];
    status: string;
    message: string;
}

/* ---------- Helper Functions for Live Data ---------- */

export async function fetchLiveData(symbol: string): Promise<LiveData | null> {
    const currentTime = new Date();

    // Get cached data
    const { data: cachedData, updatedAt } = await getCachedLiveData(symbol);

    // Check if cached data is valid
    if (
        cachedData &&
        updatedAt &&
        currentTime.getTime() - updatedAt.getTime() < cacheDuration
    ) {
        return cachedData;
    }

    // Fetch new data from API
    const liveData = await fetchLiveDataFromAPI(symbol);

    if (liveData) {
        await setCachedLiveData(symbol, liveData);
        return liveData;
    }

    // Return cached data if API fails
    return cachedData;
}

async function fetchLiveDataFromAPI(symbol: string): Promise<LiveData | null> {
    try {
        const response = await fetch(
            `${TWELVEDATA_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${TWELVEDATA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`TwelveData API error: ${response.statusText}`);
        }

        const data = await response.json();


        console.log("raw response:", data);
        if (data.status === 'error') {
            throw new Error(`TwelveData API error: ${data.message}`);
        }

        if (data) {
            return {
                price: parseFloat(data.close) || null,
                volume: parseInt(data.volume, 10) || null,
                open: parseFloat(data.open) || null,
                high: parseFloat(data.high) || null,
                low: parseFloat(data.low) || null,
                change: parseFloat(data.change) || null,
                percent_change: parseFloat(data.percent_change) || null,
                name: data.name,
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching live data:', error);
        return null;
    }
}

async function getCachedLiveData(abbreviation: string): Promise<{ data: LiveData | null; updatedAt: Date | null }> {
    const result = await sql`
        SELECT cached_live_data, updated_at_live_data
        FROM stock
        WHERE abbreviation = ${abbreviation}
        LIMIT 1;
    `;

    if (result.length === 0) {
        return { data: null, updatedAt: null };
    }

    const data = result[0].cached_live_data;
    const updatedAt = result[0].updated_at_live_data ?? null;

    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    return {
        data: parsedData ?? null,
        updatedAt,
    };
}

async function setCachedLiveData(abbreviation: string, data: LiveData): Promise<void> {
    const name = data.name ?? null;
    delete data.name;
    await sql`
        UPDATE stock
        SET cached_live_data = ${data},
            updated_at_live_data = NOW(),
            name = ${name}
        WHERE abbreviation = ${abbreviation};
    `;
}

/* ---------- Helper Functions for Time Series Data ---------- */

export async function fetchTimeSeriesData(
    symbol: string,
    interval: string,
    outputsize: number,
    forceUpdate: boolean = false
): Promise<Array<z.infer<typeof TimeSeriesSchema>> | undefined> {
    const currentTime = new Date();

    // Get cached data
    const { data: cachedData, updatedAt } = await getCachedTimeSeriesData(symbol);

    // Check if cached data is valid
    if (
        !forceUpdate &&
        cachedData &&
        cachedData.values &&
        Array.isArray(cachedData.values) &&
        updatedAt &&
        currentTime.getTime() - updatedAt.getTime() < cacheDuration
    ) {
        // Return parsed cached data
        return parseTimeSeriesData(cachedData.values);
    }

    // Fetch new data from API
    const fetchedData = await fetchTimeSeriesDataFromAPI(symbol, interval, outputsize);

    if (fetchedData && fetchedData.values && Array.isArray(fetchedData.values)) {
        // Update cache
        await setCachedTimeSeriesData(symbol, fetchedData);
        return parseTimeSeriesData(fetchedData.values);
    }

    // Return cached data if API fails
    if (cachedData && cachedData.values) {
        return parseTimeSeriesData(cachedData.values);
    }

    return undefined;
}

async function fetchTimeSeriesDataFromAPI(
    symbol: string,
    interval: string,
    outputsize: number
): Promise<TimeSeriesResponse | null> {
    try {
        const response = await fetch(
            `${TWELVEDATA_BASE_URL}/time_series?symbol=${encodeURIComponent(
                symbol
            )}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVEDATA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`TwelveData Time Series API error: ${response.statusText}`);
        }

        const data: TimeSeriesResponse = await response.json();

        if (data.status === 'error') {
            throw new Error(`TwelveData Time Series API error: ${data.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error fetching Time Series data:', error);
        return null;
    }
}

async function getCachedTimeSeriesData(abbreviation: string): Promise<{ data: TimeSeriesResponse | undefined; updatedAt: Date | undefined }> {
    const result = await sql`
        SELECT cached_time_series_data, updated_at_time_series_data
        FROM stock
        WHERE abbreviation = ${abbreviation}
        LIMIT 1;
    `;

    if (result.length === 0) {
        return { data: undefined, updatedAt: undefined };
    }

    const data = result[0].cached_time_series_data;
    const updatedAt = result[0].updated_at_time_series_data ?? undefined;

    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    return {
        data: parsedData ?? undefined,
        updatedAt,
    };
}

async function setCachedTimeSeriesData(abbreviation: string, data: TimeSeriesResponse): Promise<void> {
    await sql`
        UPDATE stock
        SET cached_time_series_data = ${data},
            updated_at_time_series_data = NOW()
        WHERE abbreviation = ${abbreviation};
    `;
}

function parseTimeSeriesData(values: TimeSeriesDataPoint[]): Array<z.infer<typeof TimeSeriesSchema>> {
    return values.map((point: any) => {
        return TimeSeriesSchema.parse({
            datetime: point.datetime,
            open: parseFloat(point.open),
            high: parseFloat(point.high),
            low: parseFloat(point.low),
            close: parseFloat(point.close),
        });
    });
}