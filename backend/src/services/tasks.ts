import { prisma } from "../db/prisma";
import { getLLMConnector } from "../lib/llm-connector";
import { logger } from "../lib/logger";
import fs from "fs/promises";
import path from "path";

export async function generateDailyTask() {
    return generateTask("DAILY");
}

export async function generateWeeklyTask() {
    return generateTask("WEEKLY");
}

export async function todaysTask() {
  const task = await prisma.task.findFirst({
    where: { type: "DAILY" },
    select: {
      createdAt: true,
      title: true,
      description: true,
      difficulty: true,
      id: true,
      type: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  if (!task) {
    return await generateDailyTask();
  }
  const last = task.createdAt;
  const today = new Date();
  if (last.getDate() === today.getDate() && last.getMonth() === today.getMonth() && last.getFullYear() === today.getFullYear()) {
    return task;
  }
  else {
    return await generateDailyTask();
  }
}

export async function thisWeeksTasks() {
  const tasks = await prisma.task.findMany({
    where: { type: "WEEKLY" },
    select: {
      createdAt: true,
      title: true,
      description: true,
      difficulty: true,
      id: true,
      type: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });
  
  if (tasks.length === 0) {
    return await Promise.all([
      generateWeeklyTask(),
      generateWeeklyTask(),
      generateWeeklyTask(),
      generateWeeklyTask(),
      generateWeeklyTask()
    ]);
  }
  
  const last = tasks[0].createdAt;
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    // Return existing tasks. (It might be less than 5 if we didn't generate 5 before, but going forward it will be 5)
    return tasks;
  }
  else {
    return await Promise.all([
      generateWeeklyTask(),
      generateWeeklyTask(),
      generateWeeklyTask(),
      generateWeeklyTask(),
      generateWeeklyTask()
    ]);
  }
}

async function generateTask(taskType: "DAILY" | "WEEKLY") {
    const badges = await prisma.badge.findMany({
        where: {
            type: "SKILL"
        },
        select: {
            id: true,
            name: true,
            description: true
        }
    });

    const systemPrompt = `You are a Linux instructor. Create a ${taskType.toLowerCase()} Linux task. ${taskType === 'WEEKLY' ? 'Weekly tasks should be slightly more complex and test a combination of skills.' : ''}

Provide:
1. A JSON block.
2. A Bash validator block.

JSON format:
{
  "title": "string",
  "description": "string (must include EVERY requirement that the validator checks)",
  "difficulty": "${taskType === 'WEEKLY' ? 'INTERMEDIATE | ADVANCED' : 'BEGINNER | INTERMEDIATE | ADVANCED'}"
}

The validator must:
- Exit 0 if the task is completed, otherwise non-zero.
- Validate only requirements explicitly stated in the description.
- Not assume default Linux behavior or implementation details.
- Accept any valid solution that satisfies the described requirements.`;
    const msg = `Create a new ${taskType.toLowerCase()} Linux task.`;
    const t = await getLLMConnector().completion(systemPrompt, [msg]);
    // Extract JSON block
    let jsonStr = "";
    const jsonMatch = t.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || t.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
    } else {
        throw new Error("Could not find JSON block in LLM response");
    }

    // Extract Bash block
    let bashScript = "";
    const bashMatch = t.match(/```(?:bash|sh|shell)\s*([\s\S]*?)\s*```/);
    if (bashMatch) {
        bashScript = bashMatch[1].trim();
    } else {
        // Fallback: if no bash block, try to find any code block that isn't JSON
        const allBlocks = [...t.matchAll(/```[\s\S]*?\n([\s\S]*?)\n```/g)];
        if (allBlocks.length > 1) {
            bashScript = allBlocks[1][1].trim();
        } else {
            throw new Error("Could not find Bash script block in LLM response");
        }
    }

    const parsedTask = JSON.parse(jsonStr);
    parsedTask.validatorScript = bashScript;

    // Batching available badges to evaluate if the task improves any of them
    const batchSize = 5;
    const selectedBadgeIds: string[] = [];

    for (let i = 0; i < badges.length; i += batchSize) {
        const batch = badges.slice(i, i + batchSize);
        const badgePrompt = `Does the following Linux task improve any of these skills?\n\nTask Title: ${parsedTask.title}\nTask Description: ${parsedTask.description}\n\nSkills:\n${batch.map(b => `- ${b.name}: ${b.description}`).join('\n')}\n\nRespond ONLY with a JSON array of skill names that this task improves. For example: ["Grep Guru", "Sed Sorcerer"]. Return an empty array [] if none match.`;

        const badgeResponse = await getLLMConnector().completion("You are a helpful assistant mapping tasks to skills. Output only JSON array of strings.", [badgePrompt]);

        try {
            const badgeNames: string[] = JSON.parse(badgeResponse.replace(/```json|```/g, "").trim());
            for (const name of badgeNames) {
                const matchingBadge = batch.find(b => b.name === name);
                if (matchingBadge) {
                    selectedBadgeIds.push(matchingBadge.id);
                }
            }
        } catch (e) {
            logger.error("Failed to parse badge evaluation JSON", badgeResponse);
        }
    }

    logger.info(`Generated ${taskType.toLowerCase()} task: ${parsedTask.title}, improving badges: ${selectedBadgeIds.length}`);

    const task = await prisma.task.create({
        data: {
            title: parsedTask.title,
            description: parsedTask.description,
            difficulty: parsedTask.difficulty || "ADVANCED",
            type: taskType,
            badge: {
                connect: selectedBadgeIds.map(id => ({ id }))
            }
        },
        select: {
            title: true,
            description: true,
            difficulty: true,
            createdAt: true,
            id: true,
            type: true
        }
    });

    if (parsedTask.validatorScript) {
        const validatorsDir = path.join(process.cwd(), "files", "validators");
        await fs.mkdir(validatorsDir, { recursive: true });
        const scriptPath = path.join(validatorsDir, `${task.id}.sh`);
        // Ensure the script starts with a shebang if missing
        const scriptContent = parsedTask.validatorScript.startsWith("#!")
            ? parsedTask.validatorScript
            : `#!/bin/bash\n${parsedTask.validatorScript}`;
        await fs.writeFile(scriptPath, scriptContent, { mode: 0o755 });
        logger.info(`Saved validator script for task ${task.id} at ${scriptPath}`);
    }

    return task;
}