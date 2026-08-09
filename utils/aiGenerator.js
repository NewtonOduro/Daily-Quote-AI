/**
 * aiGenerator.js
 * ------------------------------------------------------------------
 * Optional AI quote generation backed by the OpenAI Chat Completions
 * API. Completely optional: if no API key is configured, generation
 * gracefully falls back to a deterministic local template generator so
 * the feature always works offline.
 */
import { AI_CONFIG } from "./constants";
import { getSyncValue, setSync } from "./chromeStorage";
import { STORAGE_KEYS } from "./constants";

/**
 * Normalize a raw API response into a quote object.
 * @param {string} rawText
 * @param {string} category
 * @returns {{id: string, text: string, author: string, category: string, ai: boolean}}
 */
export const normalizeQuote = (rawText, category) => {
  const cleaned = rawText.trim().replace(/^["']|["']$/g, "");
  const [textPart, ...authorParts] = cleaned.split(/\s*[-–—]\s*/);
  const author = authorParts.length ? authorParts.join(" - ").trim() : "Daily Quotes AI";
  return {
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: textPart.trim() || "Inspiration lives where curiosity meets courage.",
    author,
    category: category || "motivation",
    ai: true
  };
};

/**
 * Deterministic local fallback generator (offline safe).
 * @param {string} category
 * @returns {{id: string, text: string, author: string, category: string, ai: boolean}}
 */
export const generateLocalQuote = (category = "motivation") => {
  const templates = [
    "Every great achievement begins with a single deliberate step today.",
    "Let your focus be sharper than your distractions.",
    "Discipline is the bridge between your goals and your results.",
    "Small consistent actions compound into extraordinary outcomes.",
    "The obstacle becomes the path when you choose to move forward.",
    "Your potential is the quiet promise of all you have yet to try.",
    "Master the day and the days will master your year.",
    "Clarity comes from action, not from waiting for perfection.",
    "Protect your energy; invest it where growth happens.",
    "Courage is the willingness to begin before you feel ready."
  ];
  const seed = Math.floor(Math.random() * templates.length);
  const text = templates[seed];
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    author: "Daily Quotes AI",
    category,
    ai: true,
    local: true
  };
};

/**
 * Request an AI-generated quote from OpenAI.
 * @param {string} category
 * @param {string} [apiKey] optional override key
 * @returns {Promise<object>} normalized quote
 */
export const generateQuote = async (category = "motivation", apiKey) => {
  const key = apiKey || (await getSyncValue(STORAGE_KEYS.SYNC_API_KEY, ""));
  if (!key) return generateLocalQuote(category);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(AI_CONFIG.ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a concise quote generator. Return a single inspirational quote in the format: \"Quote text\" - Author. Keep it under 40 words and do not add extra commentary."
          },
          { role: "user", content: `Category: ${category}. Generate a fresh, original quote.` }
        ],
        max_tokens: AI_CONFIG.MAX_TOKENS,
        temperature: AI_CONFIG.TEMPERATURE
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Empty response");
    return normalizeQuote(text, category);
  } catch (err) {
    return generateLocalQuote(category);
  }
};

/**
 * Persist an API key to chrome.storage.sync.
 * @param {string} key
 * @returns {Promise<void>}
 */
export const saveApiKey = (key) => setSync({ [STORAGE_KEYS.SYNC_API_KEY]: key });

/**
 * Read the currently stored API key.
 * @returns {Promise<string>}
 */
export const getCurrentApiKey = () =>
  getSyncValue(STORAGE_KEYS.SYNC_API_KEY, "");

export default { generateQuote, generateLocalQuote, normalizeQuote, saveApiKey, getCurrentApiKey };
