import { exec } from "child_process";
import * as pty from "node-pty";
import { Server, Socket } from "socket.io";
import { promisify } from "util";
import { logger } from "../lib/logger";
import { verifyClerkSocketToken } from "../middleware/verifyClerkAuth";

const execAsync = promisify(exec);

const TERMINAL_SUPPORTED = process.platform !== "win32";
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const PLAYER_IMAGE = "shellquest-player";

interface UserContainerState {
  containerName: string;
  activeSockets: Set<string>; // socket IDs
  inactivityTimer: NodeJS.Timeout | null;
}
const userContainers = new Map<string, UserContainerState>();

async function ensureContainerRunning(userId: string): Promise<string> {
  const containerName = `sq-${userId}`;

  try {
    const { stdout } = await execAsync(`docker inspect -f '{{.State.Running}}' ${containerName}`);
    if (stdout.trim() === "true") {
      return containerName; // Already running
    } else {
      await execAsync(`docker start ${containerName}`);
      return containerName;
    }
  } catch (error) {
    try {
      await execAsync(`docker rm -f ${containerName}`);
    } catch { }
    await execAsync(`docker run -d --name ${containerName} --hostname shellquest ${PLAYER_IMAGE} sleep infinity`);
    return containerName;
  }
}

async function ensurePlayerImageExists() {
  try {
    await execAsync(`docker image inspect ${PLAYER_IMAGE}`);
  } catch {
    await execAsync(`docker build -t ${PLAYER_IMAGE} -f Dockerfile.player .`);
  }
}

async function removeContainer(userId: string) {
  const containerName = `sq-${userId}`;
  try {
    await execAsync(`docker rm -f ${containerName}`);
    logger.info(`Removed container ${containerName}`);
  } catch (err) {
    logger.error(`Error removing container ${containerName}: ${err}`);
  }
}

export function registerTerminalHandler(io: Server) {
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const userId = await verifyClerkSocketToken(token);
    if (!userId) return next(new Error("Unauthorized"));
    (socket as any).userId = userId;
    next();
  });

  io.on("connection", async (socket: Socket) => {
    if (!TERMINAL_SUPPORTED) {
      socket.emit(
        "terminal-error",
        "The live terminal is disabled on Windows in this setup. Use WSL to enable it."
      );
      return;
    }

    const userId = (socket as any).userId;
    const containerName = `sq-${userId}`;

    // Update state
    let state = userContainers.get(userId);
    if (!state) {
      state = { containerName, activeSockets: new Set(), inactivityTimer: null };
      userContainers.set(userId, state);
    }

    state.activeSockets.add(socket.id);
    if (state.inactivityTimer) {
      clearTimeout(state.inactivityTimer);
      state.inactivityTimer = null;
    }

    try {
      await ensurePlayerImageExists();
      await ensureContainerRunning(userId);
    } catch (err: any) {
      logger.error(`Failed to start container for ${userId}: ${err.message}`);
      socket.emit("terminal-error", "Failed to start isolated environment.");
      return;
    }

    let shell: pty.IPty | null = null;
    try {
      shell = pty.spawn("docker", ["exec", "-it", containerName, "/bin/bash"], {
        name: "xterm-256color",
        cols: 80,
        rows: 30,
      });
    } catch (err) {
      logger.error(`Failed to spawn pty for ${userId}: ${err}`);
      socket.emit("terminal-error", "Failed to connect to isolated terminal.");
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
    });

    socket.on("terminal-restart", async () => {
      if (shell) {
        shell.kill();
        shell = null;
      }
      // Clean up the container
      await removeContainer(userId);
      // Wait for it to be removed, then emit event
      socket.emit("terminal-restarted");

      try {
        await ensurePlayerImageExists();
        await ensureContainerRunning(userId);
      } catch (err: any) {
        logger.error(`Failed to start container for ${userId}: ${err.message}`);
        socket.emit("terminal-error", "Failed to start isolated environment.");
        return;
      }

      try {
        shell = pty.spawn("docker", ["exec", "-it", containerName, "/bin/bash"], {
          name: "xterm-256color",
          cols: 80,
          rows: 30,
          cwd: process.cwd(),
          env: process.env as any,
        });
      } catch (err) {
        logger.error(`Failed to spawn pty for ${userId}: ${err}`);
        socket.emit("terminal-error", "Failed to connect to isolated terminal.");
        return;
      }

      outputBuffer = "";
      shell.onData((data) => {
        outputBuffer += data;
        if (outputBuffer.length > 4000) outputBuffer = outputBuffer.slice(-4000);
        socket.emit("terminal-output", data);
      });
    });

    socket.on("disconnect", () => {
      shell?.kill();

      const st = userContainers.get(userId);
      if (st) {
        st.activeSockets.delete(socket.id);
        if (st.activeSockets.size === 0) {
          st.inactivityTimer = setTimeout(async () => {
            await removeContainer(userId);
            userContainers.delete(userId);
          }, INACTIVITY_TIMEOUT_MS);
        }
      }
    });
  });
}
