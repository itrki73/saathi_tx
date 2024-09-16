import { NextResponse } from "next/server";
import { DeviceService } from "../../services/device_service";


const service = new DeviceService();

export async function POST(request:Request) {
    try {
        const data =await request.json();
        const device = await service.addDevice(data)

        if(!device){
            return  NextResponse.json("Device not created",{status:203});
        }

        return NextResponse.json(device,{status:200});

    } catch (error) {
        return NextResponse.json("something went wrong",{status:203});
    }
}