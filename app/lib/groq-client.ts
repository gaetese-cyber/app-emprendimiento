import Groq from "groq-sdk";

let cached: Groq | null = null;

export function getGroq(): Groq {
  if (!cached) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY missing");
    }
    cached = new Groq({ apiKey });
  }
  return cached;
}
