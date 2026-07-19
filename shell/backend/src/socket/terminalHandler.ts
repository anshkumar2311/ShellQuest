import * as pty from "node-pty";
import { Server, Socket } from "socket.io";
import { verifyClerkSocketToken } from "../middleware/verifyClerkAuth";

const SHELL = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "bash";
const TERMINAL_SUPPORTED = process.platform !== "win32";

/**
 * Very small heuristic verifier: after each command, check whether the
 * output looks like today's task got done. In a real project you'd run a
 * proper verify command (see dailyTask.routes.ts TASK_LIST) and diff output.
 */
function looksLikeTaskDone(taskId: string, recentOutput: string): boolean {
  // Placeholder heuristic — replace with real checks (e.g. run `ls`, `find`,
  // parse output) matching each task's verifyCommand.
  return false;
}

export function registerTerminalHandler(io: Server) {
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const userId = await verifyClerkSocketToken(token);
    if (!userId) return next(new Error("Unauthorized"));
    (socket as any).userId = userId;
    next();
  });

  io.on("connection", (socket: Socket) => {
    if (!TERMINAL_SUPPORTED) {
      socket.emit(
        "terminal-error",
        "The live terminal is disabled on Windows in this setup. Use WSL to enable it."
      );
      return;
    }

    let shell: pty.IPty | null = null;

    try {
      shell = pty.spawn(SHELL, [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.env.HOME || process.env.USERPROFILE || process.cwd(),
        env: process.env as any,
      });
    } catch {
      socket.emit("terminal-error", "Terminal is unavailable in this Windows setup.");
      return;
    }

    let outputBuffer = "";

    shell.onData((data) => {
      outputBuffer += data;
      if (outputBuffer.length > 4000) outputBuffer = outputBuffer.slice(-4000);
      socket.emit("terminal-output", data);
    });

    socket.on("terminal-input", (data: string) => {
      if (!shell) return;
      shell.write(data);

      // crude "did they hit enter" check — real verification should run the
      // task's own verifyCommand rather than pattern-matching raw input
      if (data.includes("\r")) {
        // Example: award today's task once countCompletedTasks logic in
        // dailyTask.routes.ts is triggered by the frontend explicitly.
        // This hook is left here for extending automatic verification.
      }
    });

    socket.on("disconnect", () => {
      shell?.kill();
    });
  });
}
