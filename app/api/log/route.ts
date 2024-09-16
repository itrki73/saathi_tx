import { NextResponse } from "next/server";
import { LogService } from "../../services/log_service";


const service = new LogService();

export async function GET(request: Request) {
  try {
    const logs = await service.getAllLogs();

    if (!logs) {
      return NextResponse.json([], { status: 200 })
    }

    return logs;
  } catch (error) {
    return NextResponse.json("Somthing went wrong", { status: 204 })
  }
}


export async function POST(request: Request) {
  try {
    const data = await request.json();

    const logs = await service.getDeviceLogs(data.device_uid);

    if (!logs) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    return NextResponse.json("Somthing went wrong", { status: 204 })
  }
}