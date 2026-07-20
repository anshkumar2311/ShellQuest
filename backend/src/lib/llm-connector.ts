export type LLMConnector = {
    isInit: boolean;
    init: () => Promise<boolean>;
    completion: (systemPrompt: string, messages: string[]) => Promise<string>;
};

export const geminiConnector: LLMConnector = {
    isInit: true,
    init: () => Promise.resolve(true),
    completion: async (systemPrompt: string, messages: string[]) => {
        const message = messages.join('\n');
        const text = systemPrompt ? `${systemPrompt}\n\nUser question: ${message}` : message;
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.AI_API_KEY || ""}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text }] }],
                }),
            }
        );
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
};

export const openaiConnector: LLMConnector = {
    isInit: true,
    init: () => Promise.resolve(true),
    completion: async (systemPrompt: string, messages: string[]) => {
        const msgs = [];
        if (systemPrompt) {
            msgs.push({ role: "system", content: systemPrompt });
        }
        for (const msg of messages) {
            msgs.push({ role: "user", content: msg });
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.AI_API_KEY || ""}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                messages: msgs,
            }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? "";
    }
};

export const groqConnector: LLMConnector = {
    isInit: true,
    init: () => Promise.resolve(true),
    completion: async (systemPrompt: string, messages: string[]) => {
        const msgs = [];
        if (systemPrompt) {
            msgs.push({ role: "system", content: systemPrompt });
        }
        for (const msg of messages) {
            msgs.push({ role: "user", content: msg });
        }

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.AI_API_KEY || ""}`,
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
                messages: msgs,
            }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? "";
    }
};

const AI_PROVIDER = process.env.AI_PROVIDER || "groq"; // "groq" | "gemini" | "openai"
let connector: LLMConnector | null = null;

export function getLLMConnector(): LLMConnector {
    if (connector) return connector;

    if (AI_PROVIDER === "openai") connector = openaiConnector;
    else if (AI_PROVIDER === "gemini") connector = geminiConnector;
    else connector = groqConnector;

    connector.init();
    return connector;
}