import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { getLLMConnector } from "../lib/llm-connector";

import { prisma } from "../db/prisma";
import { generateChatTitle, generateChatSummary } from "../services/aiService";
import { HeatmapActivity, HeatmapActivitySchema, Message, MessageSchema } from "../types/schemas";

const router = Router();

// POST /api/ai-chat
router.post("/", verifyClerkAuth, async (req, res) => {
  const { message, chatId } = req.body as { message?: string; chatId?: string };
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const systemPrompt =
      "You are a friendly Linux teaching assistant inside a learning app called ShellQuest. " +
      "Explain commands simply, with a short example. Keep answers under 120 words and strictly avoid any markdown notations.";

    const userMsg = { content: message, role: "user", timestamp: new Date().toISOString() };
    const validatedUserMsg = MessageSchema.parse(userMsg);

    // Create new chat if missing
    let chat = null;
    let isNewChat = false;

    if (chatId) {
      chat = await prisma.chat.findUnique({ where: { id: chatId } });
    }

    let existingMessages: Message[] = [];
    if (!chat) {
      isNewChat = true;
      const title = await generateChatTitle(message);
      chat = await prisma.chat.create({
        data: {
          userId: req.userId!,
          title,
          summary: "New conversation",
          messages: [validatedUserMsg]
        }
      });

      // Add AI Chat Heatmap event
      const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { heatmap: true } });
      let currentHeatmap: HeatmapActivity[] = [];
      try {
        currentHeatmap = HeatmapActivitySchema.array().parse(user?.heatmap);
      } catch (e) {
        console.error("Failed to parse heatmap, defaulting to empty array", e);
      }
      const heatmapEvent: HeatmapActivity = {
        type: "ai",
        title: "Started AI Chat",
        detail: `Chat: ${title}`,
        badge: "AI Assistant",
        date: new Date().toISOString()
      };
      await prisma.user.update({
        where: { id: req.userId! },
        data: { heatmap: [...currentHeatmap, heatmapEvent] }
      });
    } else {
      try {
        existingMessages = MessageSchema.array().parse(chat.messages);
      } catch (e) {
        console.error("Failed to parse messages, defaulting to empty array", e);
      }
      chat = await prisma.chat.update({
        where: { id: chat.id },
        data: {
          messages: [...existingMessages, validatedUserMsg]
        }
      });
    }

    // Pass past messages to the LLM
    const pastMessages = (Array.isArray(chat.messages) ? chat.messages : []).map((m: any) => m.content);

    // We already pushed the userMsg, so pastMessages ends with the latest message.
    const reply = await getLLMConnector().completion(systemPrompt, pastMessages);

    const aiMsg = { content: reply, role: "ai", timestamp: new Date().toISOString() };
    const validatedAiMsg = MessageSchema.parse(aiMsg);

    // Append AI reply
    const messagesWithReply: Message[] = [...existingMessages, validatedUserMsg, validatedAiMsg];
    await prisma.chat.update({
      where: { id: chat.id },
      data: { messages: messagesWithReply }
    });

    res.json({ reply, chatId: chat.id, title: chat.title, summary: chat.summary });

    // Asynchronous Summary Debounce Logic
    const currentMessagesLength = messagesWithReply.length;
    setTimeout(async () => {
      try {
        const latestChat = await prisma.chat.findUnique({ where: { id: chat!.id } });
        const latestLen = Array.isArray(latestChat?.messages) ? latestChat!.messages.length : 0;
        if (latestLen === currentMessagesLength && latestChat) {
          const summary = await generateChatSummary(latestChat.messages as any[]);
          await prisma.chat.update({
            where: { id: chat!.id },
            data: { summary }
          });
        }
      } catch (e) {
        console.error("Summary generation failed:", e);
      }
    }, 10000); // 10 seconds debounce

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI chat failed" });
  }
});

// GET /api/ai-chat
router.get("/", verifyClerkAuth, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.userId! },
      select: {
        id: true,
        title: true,
        summary: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" }
    });
    res.json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// GET /api/ai-chat/:chatId
router.get("/:chatId", verifyClerkAuth, async (req, res) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: req.params.chatId }
    });
    if (!chat || chat.userId !== req.userId) {
      return res.status(404).json({ error: "Chat not found" });
    }
    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

export default router;
