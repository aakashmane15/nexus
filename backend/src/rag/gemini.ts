import "dotenv/config";

const API_KEY = process.env.GEMINI_API_KEY;
const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL ?? "gemini-embedding-001";
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL ?? "gemini-2.5-flash";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

if (!API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is missing. Copy .env.example to .env and fill it in.",
  );
}

async function postJson<T>(
  url: string,
  body: unknown,
  attempt = 1,
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY!,
      },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    // Retry on network drops or DNS failures up to 3 times
    if (attempt < 4) {
      const waitMs = 500 * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, waitMs));
      return postJson<T>(url, body, attempt + 1);
    }
    throw new Error(
      `Network failure connecting to Gemini after ${attempt} attempts: ${(networkError as Error).message}`,
    );
  }

  // 429 = Rate limit, 5xx = Server error. Both are transient and worth retrying.
  if ((res.status === 429 || res.status >= 500) && attempt < 4) {
    const waitMs = 500 * 2 ** (attempt - 1);
    await new Promise((r) => setTimeout(r, waitMs));
    return postJson<T>(url, body, attempt + 1);
  }

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `Gemini API Error ${res.status}: ${errorBody.slice(0, 300)}`,
    );
  }

  return (await res.json()) as T;
}

export async function embed(text: string): Promise<number[]> {
  const data = await postJson<{ embedding: { values: number[] } }>(
    `${BASE}/models/${EMBED_MODEL}:embedContent`,
    {
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    },
  );

  if (!data.embedding?.values) {
    throw new Error("Gemini did not return embedding values.");
  }

  return data.embedding.values;
}

export async function generate(prompt: string): Promise<string> {
  const data = await postJson<{
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  }>(`${BASE}/models/${CHAT_MODEL}:generateContent`, {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  });

  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error(
      "Gemini returned no text (safety block or empty response).",
    );
  }

  return text;
}
