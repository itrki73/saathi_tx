import { NextResponse } from "next/server";
import { LogService } from "../../services/log_service";


const service = new LogService();

export async function GET(request: Request) {
  try {
    const logs = await service.getAllLogs();

    if (!logs) {
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    return NextResponse.json("Somthing went wrong", { status: 204 })
  }
}


export async function POST(request: Request) {
  try {
    const data = await request.json();

    const logs = await service.getLogsForDevice(data.device_uid);

    if (!logs) {
      return NextResponse.json([], { status: 200 });
    }

    console.log(logs)
    return NextResponse.json(logs.device_logs, { status: 200 });
  } catch (error) {
    return NextResponse.json("Somthing went wrong", { status: 204 })
  }
}