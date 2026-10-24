// Vercel serverless function. The API key lives in an environment variable, never in code (Week 4).
const MAX_TOKENS = 400; // cap on reply length (Week 4: token limiting)
const SYSTEM = `You are Course Companion, a friendly tutor for a 4-week Gen AI internship course.
Answer ONLY from the CONTEXT notes below. If the answer is not in them, say so and suggest a related topic.
Be concise. Mention the week you used, e.g. (Week 2). Never invent facts.`; // fixed system prompt (Week 4)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "No API key configured on the server." });
  try {
    const { messages = [], context = "", temperature = 0.3 } = req.body || {};
    const body = {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: MAX_TOKENS,
      temperature: Math.min(Math.max(Number(temperature) || 0.3, 0), 1),
      messages: [{ role: "system", content: `${SYSTEM}\n\nCONTEXT:\n${context}` }, ...messages.slice(-12)],
    };
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "OpenAI error" });
    res.json({ reply: data.choices[0].message.content, usage: data.usage });
  } catch (e) {
    res.status(500).json({ error: "Server error: " + e.message });
  }
}
