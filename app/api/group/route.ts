import { NextResponse } from "next/server";
import { GroupService } from "../../services/group_service";


const service = new GroupService();

export async function POST(request:Request) {
    try {
        const data =await request.json();
        const group = await service.AddGroup(data)

        if(!group){
            return  NextResponse.json("Device not created",{status:205});
        }

        return NextResponse.json(group,{status:200});

    } catch (error) {
        return NextResponse.json("something went wrong",{status:205});
    }
}