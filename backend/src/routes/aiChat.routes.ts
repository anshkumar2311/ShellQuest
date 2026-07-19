import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { askAi } from "../services/aiService";

const router = Router();

// POST /api/ai-chat
router.post("/", verifyClerkAuth, async (req, res) => {
  const { message } = req.body as { message?: string };
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const reply = await askAi(message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "AI chat failed" });
  }
});

export default router;
