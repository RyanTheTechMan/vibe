import { Stock, StockSchema } from '@/db/types';
import { API_BASE_URL } from "@/app/api/route_helper";
import { APIResponse, APIResponseSchema } from "@/db/helpers";

export async function fetchStockData(stock_nyse: string): Promise<Stock> {
    const response = await fetch(`${API_BASE_URL}/stocks/${stock_nyse}`);
    if (!response.ok) {
        throw new Error('Failed to fetch stock data');
    }

    const data: APIResponse = await APIResponseSchema.parseAsync(await response.json());
    return await StockSchema.parseAsync(data.content);
}