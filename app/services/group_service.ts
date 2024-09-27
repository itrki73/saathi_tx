import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface Group {
    name: string
}

export class GroupService {
   async updateGroup(data: any) {
     try {
        const update_group = await prisma.group.update({
            where: {
                uid: data.uid
            },
            data: {
                name:data.name
            }
        })

        return update_group;
     } catch (error) {
       return null;
        
     }
    }


    async getAllGroups() {
        try {
            const groups = await prisma.group.findMany();
            if (!groups) {
                return [];
            }

            return groups
        } catch (error) {
            throw new Error("Method not implemented.");
        }
    }

    async AddGroup(data: Group) {
        const log = await prisma.group.create({
            data: {
                ...data
            }
        });

        if (!log) {
            return null;
        }
        return log;
    }


    async getGroupByName(group_name: string) {
        console.log(group_name);
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