import { NextRequest } from "next/server";
import { GetUserDevices } from "@/app/actions/get-user-devices";

export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get("bookId") ?? "";
  const result = await GetUserDevices(bookId);
  return Response.json(result, { status: 200 });
}
