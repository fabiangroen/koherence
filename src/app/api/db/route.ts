import { auth } from "@/auth";
import { db } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (session?.user?.email !== "fhrgroen@gmail.com") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { query } = await req.json();

    try {
        const result = await db.run(query);
        return NextResponse.json(result);
    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
}