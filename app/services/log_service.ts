import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class LogService {
    async addLog(data: any) {
        const log = await prisma.deviceLog.create({
            data: {
                ...data
            }
        })
    }


    async getDeviceLogs(device_uid: any) {
        try {
            const logs = prisma.deviceLog.findMany(
                {
                    where: {
                        device_uid: device_uid
                    }
                }
            )

            if(!logs){
                return null;
            }

            return logs;
        } catch (error:any) {
              throw new Error(error.message);
        }
    }

    async getAllLogs() {
        try {
            const logs = await prisma.deviceLog.findMany();
            if (!logs) {
                return null;
            }
            return logs;
        } catch (error: any) {
            throw new Error(error.message)
        }
    }
}