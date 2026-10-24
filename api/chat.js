// Vercel serverless function: POST /api/chat
// The API key is read from the OPENAI_API_KEY environment variable on the server only.
const MAX_TOKENS = 400;       // cap on reply length (token limiting)
const MAX_CONTEXT_CHARS = 6000; // cap on retrieved notes sent to the model
const SYSTEM = `You are Course Companion, a friendly tutor for a 4-week Gen AI internship course.
Answer ONLY from the CONTEXT notes below. If the answer is not in them, say so and suggest a related topic.
Be concise. Mention the week you used, e.g. (Week 2). Never invent facts.`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "OPENAI_API_KEY is not set on the server." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body || "{}");
    body = body || {};

    const messages = Array.isArray(body.messages)
      ? body.messages
          .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
          .slice(-12)
          .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
      : [];
    if (!messages.length) return res.status(400).json({ error: "No messages provided." });

    const context = String(body.context || "").slice(0, MAX_CONTEXT_CHARS);
    const temperature = Math.min(Math.max(Number(body.temperature) || 0.3, 0), 1);

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        max_tokens: MAX_TOKENS,
        temperature,
        messages: [{ role: "system", content: `${SYSTEM}\n\nCONTEXT:\n${context}` }, ...messages],
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: (data.error && data.error.message) || "OpenAI request failed." });

    return res.status(200).json({ reply: data.choices[0].message.content, usage: data.usage });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
};

