// Heuristic jailbreak detector. Cheap regex pass that catches casual prompt
// injection attempts before they ever reach the LLM (saving tokens). A
// motivated attacker will phrase around these — that's expected; the goal is
// to filter the 90% of low-effort attempts that consume API budget.

const JAILBREAK_PATTERNS: RegExp[] = [
  // Spanish: "ignorá [todas las] instrucciones [previas/anteriores]"
  /ignor[aáeéo]\w*\s+[\w\sáéíóúñ]{0,40}?(reglas|instrucciones|directrices|prompt)/i,
  // Spanish: "olvidá [tu/todas las] instrucciones/rol/sistema"
  /olvid[aáeéo]\w*\s+[\w\sáéíóúñ]{0,40}?(rol|instrucciones|reglas|sistema|prompt)/i,
  /system\s*prompt/i,
  /(act[uú]a|comport[aá]te|pret[eé]nde|sim[uú]l[aá])\s+(como|que\s+s[oó]s)/i,
  /\b(jailbreak|dan\s+mode|developer\s+mode)\b/i,
  /(reveal[aá]?|decime|mostr[aá]me|dame|imprim[ií])\s+(tu|el|me|las)?\s*(prompt|system|instrucciones)/i,
  /eres\s+(ahora|un|una)\s+(otra|nuevo|nueva)/i,
  /sos\s+(ahora|un|una)\s+(otra|nuevo|nueva)/i,
  // English jailbreak terms
  /\bnew\s+instructions?\b/i,
  /forget\s+(everything|all|previous|your)/i,
  /you\s+are\s+now\s+(a|an)/i,
  /ignore\s+[\w\s]{0,30}?(instructions?|rules?|prompt|system)/i,
  /disregard\s+[\w\s]{0,30}?(instructions?|rules?|prompt|system)/i,
  /(reveal|show|print|leak)\s+[\w\s]{0,20}?(prompt|system\s*message)/i,
];

const OFF_TOPIC_HARDCODED_REPLY =
  "Solo puedo ayudarte con preguntas sobre tu emprendimiento. ¿Seguimos con eso?";

export function detectJailbreak(content: string): boolean {
  if (!content) return false;
  return JAILBREAK_PATTERNS.some((rx) => rx.test(content));
}

export function offTopicReply(): string {
  return OFF_TOPIC_HARDCODED_REPLY;
}

// Returns a streaming Response that emits a fixed string and closes. Useful
// when we want to bypass the LLM entirely but still match the streaming
// contract the client expects.
export function staticStreamResponse(
  text: string,
  extraHeaders: Record<string, string> = {},
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...extraHeaders,
    },
  });
}
