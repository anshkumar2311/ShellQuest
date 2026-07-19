import { QuizQuestion } from "../types";

const AI_PROVIDER = process.env.AI_PROVIDER || "groq"; // "groq" | "gemini" | "openai"
const AI_API_KEY = process.env.AI_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Ask the AI to explain a Linux command / answer a question in plain language.
 */
async function chatCompletion(message: string, systemPrompt: string): Promise<string> {
  if (AI_PROVIDER === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a reply.";
  }

  if (AI_PROVIDER === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }] }],
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a reply.";
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a reply.";
}

export async function askAi(message: string): Promise<string> {
  const systemPrompt =
    "You are a friendly Linux teaching assistant inside a learning app called ShellQuest. " +
    "Explain commands simply, with a short example. Keep answers under 120 words.";

  return chatCompletion(message, systemPrompt);
}

/**
 * Ask the AI to generate 5 MCQ questions on a Linux topic, returned as strict JSON.
 */
export async function generateQuiz(topic: string): Promise<QuizQuestion[]> {
  const prompt =
    `Generate exactly 5 multiple choice questions about Linux topic: "${topic}". ` +
    `Respond with ONLY raw JSON, no markdown fences, in this exact shape: ` +
    `[{"question": "...", "options": ["a","b","c","d"], "correctAnswer": "a"}]`;

  let raw = "";

  if (AI_PROVIDER === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json();
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  } else {
    const res = await fetch(
      AI_PROVIDER === "openai"
        ? "https://api.openai.com/v1/chat/completions"
        : "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_PROVIDER === "openai" ? OPENAI_MODEL : GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );
    const data = await res.json();
    raw = data.choices?.[0]?.message?.content ?? "[]";
  }

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback so the app never breaks if the AI returns malformed JSON
    return [
      {
        question: `Sample question about ${topic} (AI response could not be parsed)`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
      },
    ];
  }
}
