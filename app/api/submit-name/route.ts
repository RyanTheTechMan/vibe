import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        if (!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json({ message: "Invalid name provided." }, { status: 400 });
        }

        console.log(`Received name: ${name}`);

        // You can perform additional server-side operations here (e.g., store in a database)

        return NextResponse.json({ message: `Name "${name}" received successfully.` }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }
}