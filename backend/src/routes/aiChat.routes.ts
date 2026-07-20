import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { getLLMConnector } from "../lib/llm-connector";

const router = Router();

// POST /api/ai-chat
router.post("/", verifyClerkAuth, async (req, res) => {
  const { message } = req.body as { message?: string };
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const systemPrompt =
      "You are a friendly Linux teaching assistant inside a learning app called ShellQuest. " +
      "Explain commands simply, with a short example. Keep answers under 120 words and strictly avoid any markdown notations.";

    const reply = await getLLMConnector().completion(systemPrompt, [message]);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "AI chat failed" });
  }
});

export default router;
