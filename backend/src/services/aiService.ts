import { QuizQuestion } from "../types";
import { getLLMConnector } from "../lib/llm-connector";

/**
 * Ask the AI to generate a short title for a new chat session.
 */
export async function generateChatTitle(message: string): Promise<string> {
  const prompt = `Generate a very short title (max 4-5 words) summarizing this message: "${message}". Reply ONLY with the title text.`;
  const connector = getLLMConnector();
  const raw = await connector.completion(prompt, []);
  return raw.trim() || "New Chat";
}

/**
 * Ask the AI to generate a single-line summary for a chat session.
 */
export async function generateChatSummary(messages: any[]): Promise<string> {
  const formattedMessages = messages.map(m => `${m.role}: ${m.content}`).join("\n");
  const prompt = `Generate a 1-line summary (max 15 words) of the following chat conversation:\n\n${formattedMessages}\n\nReply ONLY with the summary.`;
  const connector = getLLMConnector();
  const raw = await connector.completion(prompt, []);
  return raw.trim() || "Ongoing conversation...";
}

/**
 * Ask the AI to generate 5 MCQ questions on a Linux topic, returned as strict JSON.
 */
export async function generateQuiz(topic: string): Promise<QuizQuestion[]> {
  const prompt =
    `Generate exactly 5 multiple choice questions about Linux topic: "${topic}". ` +
    `For each question, there can be 1 or more correct options. ` +
    `Respond with ONLY raw JSON, no markdown fences, in this exact shape: ` +
    `[{"question": "...", "options": ["First option","Second option","Third option","Fourth option"], "correctAnswers": ["First option", "Third option"]}] ` +
    `IMPORTANT: The items in "correctAnswers" MUST be the exact string text from the "options" array, not letters like 'A' or 'B'.`;

  const connector = getLLMConnector();
  const raw = await connector.completion("", [prompt]);

  try {
    const cleaned = (raw || "[]").replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // Topic-aware fallback with educational explanations
    if (topic.toLowerCase().includes("permission")) {
      return [
        {
          question: "Which command is used to change file access permissions in Linux?",
          options: ["chown", "chmod", "ls -l", "touch"],
          correctAnswer: "chmod",
          explanation: "chmod (change mode) modifies read (r), write (w), and execute (x) permissions for owners, groups, and others. Unlike chown which changes ownership, chmod controls file access modes.",
          command: "chmod"
        },
        {
          question: "What does the 'r' permission letter represent?",
          options: ["Run permission", "Root permission", "Read permission", "Remove permission"],
          correctAnswer: "Read permission",
          explanation: "The 'r' flag stands for Read permission, allowing users to open and view file contents or list items inside a directory.",
          command: "ls -l"
        },
        {
          question: "Which command changes the owner of a file?",
          options: ["mkdir", "cat", "chmod", "chown"],
          correctAnswer: "chown",
          explanation: "chown (change owner) reassigns file ownership to a specified user or group. While chmod alters permissions, chown alters who owns the file.",
          command: "chown"
        },
        {
          question: "What numeric mode represents read, write, execute for owner only (700)?",
          options: ["700", "777", "644", "755"],
          correctAnswer: "700",
          explanation: "700 grants full rwx (4+2+1=7) permissions exclusively to the file owner, while restricting group members and others from any access.",
          command: "chmod 700"
        },
        {
          question: "Who can execute a file with mode 'rwxr-xr-x' (755)?",
          options: ["Owner only", "Owner, group, and all users", "Root user only", "Nobody"],
          correctAnswer: "Owner, group, and all users",
          explanation: "'rwxr-xr-x' (755) grants write access to the owner while giving read and execute ('x') permissions to owner, group, and all other users.",
          command: "chmod 755"
        }
      ];
    }

    if (topic.toLowerCase().includes("process")) {
      return [
        {
          question: "Which command provides a real-time interactive view of running processes and system resources?",
          options: ["ps aux", "kill", "top", "nice"],
          correctAnswer: "top",
          explanation: "The top command provides a dynamic real-time view of running processes along with live CPU, RAM memory usage, and system uptime metrics.",
          command: "top"
        },
        {
          question: "Which command displays a static snapshot of all active processes?",
          options: ["ps aux", "top", "pkill", "jobs"],
          correctAnswer: "ps aux",
          explanation: "ps aux outputs a static list of all active processes with PID numbers, user ownership, and memory consumption at the moment of execution.",
          command: "ps aux"
        },
        {
          question: "How does 'pkill' differ from the standard 'kill' command?",
          options: ["pkill matches by process name rather than PID", "pkill only works on root processes", "kill cannot terminate background jobs", "pkill restarts processes automatically"],
          correctAnswer: "pkill matches by process name rather than PID",
          explanation: "kill requires a numeric Process ID (PID), whereas pkill allows you to terminate processes by matching their process name directly (e.g. pkill firefox).",
          command: "pkill"
        },
        {
          question: "Which command sends a forced termination signal to a process PID?",
          options: ["kill -9", "bg", "fg", "top"],
          correctAnswer: "kill -9",
          explanation: "kill -9 sends the SIGKILL signal to immediately force-terminate a process without giving it time to perform cleanup actions.",
          command: "kill -9"
        },
        {
          question: "Which command resumes a suspended process in the background?",
          options: ["bg", "fg", "nice", "stop"],
          correctAnswer: "bg",
          explanation: "The bg command resumes a paused or suspended job in the background, allowing your active terminal shell to remain available for new input.",
          command: "bg"
        }
      ];
    }

    return [
      {
        question: `Sample question about ${topic} (AI response could not be parsed)`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
      },
      {
        question: "Which command prints your current working directory path?",
        options: ["cd", "pwd", "ls", "echo"],
        correctAnswer: "pwd",
        explanation: "pwd (print working directory) displays the full absolute file path of the directory you are currently located in.",
        command: "pwd"
      },
      {
        question: "Which command is used to create a new directory?",
        options: ["mkdir", "touch", "rmdir", "cp"],
        correctAnswer: "mkdir",
        explanation: "mkdir (make directory) creates a new empty directory folder inside your current working directory.",
        command: "mkdir"
      },
      {
        question: "Which command changes your active working directory?",
        options: ["ls", "mv", "find", "cd"],
        correctAnswer: "cd",
        explanation: "cd (change directory) navigates your terminal prompt to a specified target directory path.",
        command: "cd"
      },
      {
        question: "Which command creates an empty file or updates timestamps?",
        options: ["cat", "touch", "nano", "grep"],
        correctAnswer: "touch",
        explanation: "touch creates a new empty 0-byte file instantly if the file name does not already exist.",
        command: "touch"
      }
    ];
  }
}
