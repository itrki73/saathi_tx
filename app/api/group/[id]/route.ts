import { NextResponse } from "next/server";
import { GroupService } from "../../../services/group_service";

const service = new GroupService();

export async function GET(request: Request, context: any) {
    try {
      const { params } = context;
      const Id = params?.id as string;
  
      const group = await service.getGroupByUid(Id);
  
      if (group) {
        return NextResponse.json(group);
      } else {
        return NextResponse.json([]);
      }
    } catch (error) {
      console.error("Error fetching div:", error);
      return NextResponse.json(error);
    }
  }