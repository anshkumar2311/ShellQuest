import { Badge } from "@/prisma/client";
import { prisma } from "./prisma";

const ALL_BADGES: Omit<Badge, "id">[] = [
    { name: "First Task", description: "Complete your first daily task.", target: 1, type: "SKILL" },
    { name: "5 Tasks Done", description: "Complete 5 daily tasks.", target: 5, type: "SKILL" },
    { name: "Perfect Quiz", description: "Score 5/5 on any quiz.", target: 1, type: "SKILL" },
    // Linux Commands Badges
    { name: "Grep Guru", description: "Master the use of the grep command to find patterns.", target: 1, type: "SKILL" },
    { name: "Sed Sorcerer", description: "Successfully use sed to manipulate text streams.", target: 1, type: "SKILL" },
    { name: "Awk Master", description: "Complete an advanced text processing task using awk.", target: 1, type: "SKILL" },
    { name: "Pipe Dream", description: "Chain three or more commands together using pipes.", target: 1, type: "SKILL" },
    { name: "Permission Granted", description: "Modify file permissions correctly using chmod.", target: 1, type: "SKILL" },
    { name: "Process Killer", description: "Identify and terminate a rogue process using kill or pkill.", target: 1, type: "SKILL" },
    { name: "Tarzan", description: "Successfully compress and extract files using tar.", target: 1, type: "SKILL" },
    { name: "Vim Enthusiast", description: "Complete a challenge entirely within the Vim editor.", target: 1, type: "SKILL" },
    { name: "Nano Novice", description: "Use the Nano editor to complete a configuration task.", target: 1, type: "SKILL" },
    { name: "SSH Specialist", description: "Establish a secure connection using SSH.", target: 1, type: "SKILL" },
    { name: "Regex Rookie", description: "Solve a beginner regular expression challenge.", target: 1, type: "SKILL" },
    { name: "Directory Diver", description: "Navigate deep file hierarchies using cd and ls.", target: 1, type: "SKILL" },
    { name: "Curl Champion", description: "Fetch data from an API using curl.", target: 1, type: "SKILL" },
    // Consistency & Gameplay Badges
    { name: "Streak Starter", description: "Complete tasks for 3 consecutive days.", target: 3, type: "STREAK" },
    { name: "Dedicated Hacker", description: "Maintain a 7-day task completion streak.", target: 7, type: "STREAK" },
    { name: "Unstoppable Force", description: "Maintain an impressive 30-day streak.", target: 30, type: "STREAK" },
    { name: "Night Owl", description: "Successfully solve a challenge after midnight.", target: 1, type: "GAMEPLAY" },
    { name: "Early Bird", description: "Successfully solve a challenge before 7 AM.", target: 1, type: "GAMEPLAY" },
    { name: "Speed Demon", description: "Complete any challenge in under 30 seconds.", target: 1, type: "GAMEPLAY" },
    { name: "Perfectionist", description: "Complete 10 tasks without a single mistake.", target: 10, type: "COLLECTION" },
    { name: "Terminal Addict", description: "Spend over 10 hours solving terminal challenges.", target: 1, type: "GAMEPLAY" },
    { name: "Shell Scripter", description: "Write and execute a valid bash script.", target: 1, type: "SKILL" },
];

async function seed() {
    console.log("Seeding badges...");

    for (const badge of ALL_BADGES) {
        // We check if the badge already exists by name to avoid duplicates
        const existing = await prisma.badge.findFirst({
            where: { name: badge.name }
        });

        if (!existing) {
            await prisma.badge.create({
                data: badge
            });
            console.log(`Created badge: ${badge.name}`);
        } else {
            console.log(`Badge already exists: ${badge.name}`);
        }
    }

    console.log("Seeding complete!");
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });