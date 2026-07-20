import { QuizQuestion } from "../types";
import { getLLMConnector } from "../lib/llm-connector";

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
    // Fallback so the app never breaks if the AI returns malformed JSON
    return [
      {
        question: `Sample question about ${topic} (AI response could not be parsed)`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswers: ["Option A"],
      },
    ];
  }
}
