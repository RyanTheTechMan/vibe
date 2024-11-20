import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Builds a dynamic SET clause for SQL UPDATE statements.
 * @param data An object containing the fields to update.
 * @param specialFields An optional object mapping field names to functions that process their values.
 * @returns An object containing the SET clause string and the corresponding values array.
 */
export function buildSetClause(data: Record<string, any>, specialFields: Record<string, string> = {}) {
    const entries = Object.entries(data).filter(([_, value]) => value !== undefined);
    const setClauses = entries.map(([key], index) => {
        if (specialFields[key]) {
            return `${key} = ${specialFields[key]}($${index + 1})`;
        }
        return `${key} = $${index + 1}`;
    });
    const values = entries.map(([_, value]) => value);
    return { setClause: setClauses.join(', '), values };
}

/**
 * Builds a dynamic INSERT clause for SQL INSERT statements.
 * @param data An object containing the fields to insert.
 * @returns An object containing the columns string, placeholders string, and the corresponding values array.
 */
export function buildInsertClause(data: Record<string, any>) {
    const entries = Object.entries(data).filter(([_, value]) => value !== undefined);
    const columns = entries.map(([key]) => key);
    const placeholders = entries.map(([_, __], index) => `$${index + 1}`);
    const values = entries.map(([_, value]) => value);
    return { columns: columns.join(', '), placeholders: placeholders.join(', '), values };
}

/**
 * Parses the ID from a string or array of strings.
 * @param id The ID parameter from the route.
 * @returns The parsed ID as a number, or null if invalid.
 */
function parseId(id: string | string[]): number | null {
    const parsedId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10);
    return isNaN(parsedId) || parsedId <= 0 ? null : parsedId;
}

/**
 * Parses and validates the ID from the route parameters.
 * @param params An object containing route parameters.
 * @returns The parsed ID as a number, or a NextResponse with an error message if invalid.
 */
export function validateId(params: { id: string | string[] }): number | NextResponse {
    const tagId = parseId(params.id);
    if (!tagId) {
        return NextResponse.json(
            { success: false, message: 'Invalid ID.' },
            { status: 400 }
        );
    }
    return tagId;
}

/**
 * Generates a standardized success response.
 * @param content The data to include in the response.
 * @param message Optional success message.
 * @param status Optional HTTP status code (default: 200).
 * @returns A NextResponse object with the success payload.
 */
export function successResponse(content: any, message: string = 'Success', status: number = 200): NextResponse {
    const responseBody: APIResponse = { success: true, message, content };
    return NextResponse.json(responseBody, { status });
}

/**
 * Generates a standardized success response with pagination.
 * @param content The data to include in the response.
 * @param nextCursor The cursor for the next page of results.
 * @param message Optional success message.
 * @param status Optional HTTP status code (default: 200).
 * @returns A NextResponse object with the success payload.
 */
export function successResponsePaginated(content: any, nextCursor: number | null, message: string = 'Success', status: number = 200): NextResponse {
    const responseBody: APIResponsePaginated = { success: true, message, content, nextCursor };
    return NextResponse.json(responseBody, { status });
}

/**
 * Generates a standardized error response.
 * @param message The error message.
 * @param status The HTTP status code.
 * @param errors Optional additional error details.
 * @returns A NextResponse object with the error payload.
 */
export function errorResponse(message: string, status: number, errors?: any): NextResponse {
    const responseBody: APIResponse = { success: false, message };
    if (errors) responseBody.errors = errors;
    return NextResponse.json(responseBody, { status });
}

export const APIResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    content: z.any().optional(),
    errors: z.any().optional(),
});
export type APIResponse = z.infer<typeof APIResponseSchema>;

export const APIResponsePaginatedSchema = APIResponseSchema.extend({
    nextCursor: z.coerce.number().int().nullable(),
});
export type APIResponsePaginated = z.infer<typeof APIResponsePaginatedSchema>;