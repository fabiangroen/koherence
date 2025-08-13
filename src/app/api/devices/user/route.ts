import { GetUserDevices } from "@/app/actions/get-user-devices";

export async function GET() {
  const result = await GetUserDevices();
  return Response.json(result, { status: 200 });
}
