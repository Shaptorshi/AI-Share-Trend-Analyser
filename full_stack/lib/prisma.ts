import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'


const globalClient = global as unknown as {
    prisma?: PrismaClient
}

if (!process.env.DATABASE_URL) {
    throw new Error(`DATABASE URL is not defined in .env`)
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = globalClient.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== `production`) {
    globalClient.prisma = prisma
}