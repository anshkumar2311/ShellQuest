import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import aiChatRoutes from "./routes/aiChat.routes";
import quizRoutes from "./routes/quiz.routes";
import dailyTaskRoutes from "./routes/dailyTask.routes";
import badgesRoutes from "./routes/badges.routes";
import { registerTerminalHandler } from "./socket/terminalHandler";

const app = express();
const httpServer = createServer(app);

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/ai-chat", aiChatRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/daily-task", dailyTaskRoutes);
app.use("/api/badges", badgesRoutes);

const io = new Server(httpServer, {
  cors: { origin: FRONTEND_ORIGIN },
});
registerTerminalHandler(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`ShellQuest backend running on http://localhost:${PORT}`);
});
