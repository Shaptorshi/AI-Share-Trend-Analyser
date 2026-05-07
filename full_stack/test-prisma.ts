import { prisma } from './lib/prisma';

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected successfully");
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
