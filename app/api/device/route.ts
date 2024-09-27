import { NextResponse } from "next/server";
import { DeviceService } from "../../services/device_service";


const service = new DeviceService();


export async function GET(request: Request) {
    try {
        const devices = await service.getAllDevices();
        if (!devices) {
            return NextResponse.json([],{status:200});
        }

        return NextResponse.json(devices,{status:200});
        
    } catch (error: any) {
        return NextResponse.json(error.message, { status: 203 })
    }
}

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

export async function PUT(request:Request) {
    try {
        const data =await request.json();
        const device = await service.updateDeviceStatus(data.uid,data)

        if(!device){
            return  NextResponse.json("Device not created",{status:203});
        }

        return NextResponse.json(device,{status:200});

    } catch (error) {
        return NextResponse.json("something went wrong",{status:203});
    }
}