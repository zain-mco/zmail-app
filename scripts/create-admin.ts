import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function main() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    console.log("Connecting to database...");

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    // Admin credentials - CHANGE THESE!
    const username = "admin";
    const password = "admin123"; // Change this to a secure password!

    console.log(`Creating admin user: ${username}`);

    // Hash the password
    const password_hash = await bcrypt.hash(password, 12);

    try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { username }
        });

        if (existing) {
            console.log("User already exists. Updating password...");
            await prisma.user.update({
                where: { username },
                data: { password_hash, role: "ADMIN" }
            });
            console.log("Password updated successfully!");
        } else {
            await prisma.user.create({
                data: {
                    username,
                    password_hash,
                    role: "ADMIN"
                }
            });
            console.log("Admin user created successfully!");
        }

        console.log("\n✅ Done! You can now login with:");
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        console.log("\n⚠️  Remember to change the password after first login!");

    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(console.error);
