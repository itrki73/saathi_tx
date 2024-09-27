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



    getDefaultStartDate(): Date {
        const today = new Date();
        // Subtract 3 days from the current date
        today.setDate(today.getDate() - 3);

        console.log(today)
        // Convert to ISO string (or format as needed)
        return today; // Only keep the date part
    }

    getDefaulEndDate(): Date {
        const today = new Date();
        // Subtract 3 days from the current date
        today.setDate(today.getDate() + 2);

        console.log(today)
        // Convert to ISO string (or format as needed)
        return today; // Only keep the date part
    }

    async getLogsForDevice(uid: string, fromDate: Date = this.getDefaultStartDate(), toDate: Date = this.getDefaulEndDate()) {
        // Ensure valid dates

        fromDate.setHours(0, 0, 0, 0)

        toDate.setHours(0, 0, 0, 0)

        console.log(fromDate, toDate)
        // Find the device logs for the provided UID within the date range
        const logs = await prisma.device.findUnique({
            where: {
                uid: uid,
            },
            include: {
                device_logs: {
                    where: {
                        created_at: {
                            gte: fromDate, // Ensure ISO date format
                            lte: toDate,
                        }
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                },
            },
        });

        return logs || null;
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