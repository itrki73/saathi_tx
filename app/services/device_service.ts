import axios from "axios";
import { GroupService } from "./group_service";
import conf from "../../config/conf";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const groupService = new GroupService();

export class DeviceService {

    async getAllDevices() {
        try {
            var devices = await prisma.device.findMany();
            const sections = await axios.get(`${conf.LOCTION}/api/section`);

            if (!devices) {
                return [];
            }

            // geting section details for devices
            devices = devices
                .filter((device: { section_uid: any; }) => sections.data.some((section: { uid: any; }) => section.uid === device.section_uid)) // Filter out devices without a matching section
                .map((device: { section_uid: any; }) => {
                    const matchingSection = sections.data.find((section: { uid: any; }) => section.uid === device.section_uid);
                    return {
                        ...device,
                        section: matchingSection // Add the matching section to the device
                    };
                });

            


            return devices;
        } catch (error: any) {
            throw new Error(error);
        }
    }


    async updateDeviceStatus(uid: String, data: any) {
        console.log(uid, data)
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
            console.log(data.group_name)
            if (!group) {
                throw new Error("Group not found");
            }

            const section = await axios.get(`${conf.LOCTION}/api/section/${data.section_uid}`);

            console.log(section.data)
            if (!section.data.uid) {

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
        } catch (error: any) {
            console.log(error.message)
        }
    }


}