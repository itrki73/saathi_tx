import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface Group {
    name: string
}

export class GroupService {

    async AddGroup(data: Group) {
        const log = await prisma.group.create({
            data: {
                ...data
            }
        });

        if(!log){
            return null;
        }
        return log;
    }


    async getGroupByName(group_name: string) {
        try {
            const group = await prisma.group.findUnique({
                where: {
                    name: group_name
                }
            })

            if (!group) {
                return null;

            }

            return group;
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    async getGroupByUid(uid: string) {
        try {
            const group = await prisma.group.findUnique({
                where: {
                    uid: uid
                }
            })

            if (!group) {
                return null;

            }

            return group;
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

}