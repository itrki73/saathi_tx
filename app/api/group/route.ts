import { NextResponse } from "next/server";
import { GroupService } from "../../services/group_service";


const service = new GroupService();

export async function GET(request:Request) {
    try {
        const groups = await service.getAllGroups();
        if(!groups){
            return NextResponse.json([],{status:200});
        }
        return NextResponse.json(groups,{status:200});
    } catch (error:any) {
        return NextResponse.json(error.message,{status:200});
    }
}

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

export async function PUT(request:Request) {
    try {
        const data = await request.json();
        if(!data){
            return NextResponse.json("name is required to update",{status:205});
        }
        console.log(data)

        const update_group = await service.updateGroup(data);
         return  NextResponse.json(update_group,{status:200})
    } catch (error) {
        return NextResponse.json("something went wrong",{status:205});
    }
}