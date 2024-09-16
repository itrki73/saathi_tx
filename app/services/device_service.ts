import axios from "axios";
import { GroupService } from "./group_service";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const groupService = new GroupService();

export class DeviceService {
    async updateDeviceStatus(uid: String, data:any) {
        console.log(uid,data)
        try {
            const device = await prisma.device.update({
                where: {
                    uid: uid,
                },
                data: {
                    ...data
                },
            });

            return device;

        } catch (error) {
            console.error(`Failed to update device status for UID: ${uid}`, error);
            throw new Error('Failed to update device status');
        }
    }
    async addDevice(data: any) {
        try {

            const group = await groupService.getGroupByUid(data.group_uid);

            if(!group){
                throw new Error("Group not found");
            }
    
            const section = await axios.get(`http://localhost:3002/api/section/${data.section_uid}`);
             
            console.log(section.data)
            if (!section.data.uid ) {             
    
                throw new Error("Section not found");
            }
     
    
            const device = await prisma.device.create({
                data: {
                    ...data,
                }
            });
    
            if (!device) {
                return null;
            }
            return device;
        } catch (error:any) {
        console.log(error.message)
        }
    }


}