import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// Create Prisma client with pg adapter for Prisma 7
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
    console.log("🌱 Starting seed...\n");

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { username: "admin" },
    });

    if (existingAdmin) {
        console.log("⚠️  Admin user already exists. Skipping seed.");
        await prisma.$disconnect();
        await pool.end();
        return;
    }

    // Create the Super Admin user
    const password_hash = await bcrypt.hash("admin123", 12);

    const admin = await prisma.user.create({
        data: {
            username: "admin",
            password_hash,
            role: "ADMIN",
        },
    });

    console.log("✅ Super Admin created successfully!");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Role: ADMIN\n");
    console.log("⚠️  IMPORTANT: Change this password immediately after first login!\n");

    // Optionally create a demo team user
    const teamPasswordHash = await bcrypt.hash("team123", 12);

    const teamUser = await prisma.user.create({
        data: {
            username: "team1",
            password_hash: teamPasswordHash,
            role: "TEAM",
        },
    });

    console.log("✅ Demo Team user created!");
    console.log("   Username: team1");
    console.log("   Password: team123");
    console.log("   Role: TEAM\n");

    // Create a sample campaign for the team user
    await prisma.campaign.create({
        data: {
            title: "Welcome to ZMAIL - Sample Campaign",
            content_json: {
                blocks: [
                    {
                        id: "1",
                        type: "HeaderImage",
                        data: {
                            src: "",
                            alt: "Conference Header",
                        },
                    },
                    {
                        id: "2",
                        type: "TextBlock",
                        data: {
                            content: "Welcome to our Medical Conference! We are excited to have you join us for this important event.",
                        },
                    },
                    {
                        id: "3",
                        type: "Button",
                        data: {
                            text: "Register Now",
                            url: "https://example.com/register",
                            backgroundColor: "#1e40af",
                        },
                    },
                    {
                        id: "4",
                        type: "Footer",
                        data: {
                            content: "© 2024 Medical Conference. All rights reserved.",
                        },
                    },
                ],
            },
            ownerId: teamUser.id,
        },
    });

    console.log("✅ Sample campaign created for team1\n");
    console.log("🎉 Seed completed successfully!");

    await prisma.$disconnect();
    await pool.end();
}

seed()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        prisma.$disconnect();
        pool.end();
        process.exit(1);
    });
