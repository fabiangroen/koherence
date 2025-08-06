import { auth } from "@/auth";
import { db } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (session?.user?.role!='admin') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Handle JSON request
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Query parameter is required" },
        { status: 400 },
      );
    }

    try {
      const result = await db.run(query);
      return NextResponse.json({ success: true, result });
    } catch (error: any) {
      console.error("Database query error:", error);

      // Extract the actual SQL error from the cause property
      let errorMessage = error.message;
      if (error.cause?.cause?.message) {
        errorMessage = error.cause.cause.message;
      } else if (error.cause?.message) {
        errorMessage = error.cause.message;
      }

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Request parsing error:", error);
    return NextResponse.json(
      { success: false, message: "Invalid request format" },
      { status: 400 },
    );
  }
}
