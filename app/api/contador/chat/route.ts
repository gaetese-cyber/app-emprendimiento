import { getGroq } from "@/app/lib/groq-client";
import { checkRateLimit, getClientIp, rateLimitedResponse } from "@/app/lib/rate-limit";
import { detectJailbreak, offTopicReply } from "@/app/lib/sanitize";
import { z } from "zod";

const RequestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(40),
  module: z.enum(["facturacion", "contabilidad", "sociedades", "general"]).default("general"),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  facturacion: `Sos un asistente especializado en facturación e impuestos argentinos para contadores.
Respondés preguntas sobre: AFIP, monotributo, IVA, Ganancias, Bienes Personales, vencimientos fiscales,
RG AFIP, facturación electrónica (RCEL), categorías de contribuyentes, retenciones y percepciones.
Usás lenguaje técnico contable argentino. Sos preciso, conciso y siempre aclarás cuando algo puede
haber cambiado y recomendar verificar en afip.gob.ar. Nunca inventás alícuotas ni fechas.`,

  contabilidad: `Sos un asistente de contabilidad para profesionales argentinos.
Ayudás con: asientos contables, plan de cuentas (RT 9, RT 16, NIC/NIIF), estados financieros,
ajuste por inflación (RT 6, RT 39), balances, cuentas de resultado, cierre de ejercicio,
valuación de activos y pasivos según normas FACPCE.
Explicás con ejemplos de asientos cuando corresponde. Sos técnico y preciso.`,

  sociedades: `Sos un experto en derecho societario argentino para contadores.
Ayudás con: constitución de SA, SRL, SAS (Ley 27.349), sociedades de hecho, unipersonal,
IGJ/registros provinciales, estatutos, capital mínimo, trámites de inscripción,
responsabilidad de socios, libros societarios y requisitos según el tipo societario.
Explicás paso a paso y aclará qué trámites requieren intervención de escribano o abogado.`,

  general: `Sos ContaAI, un asistente virtual para contadores públicos argentinos.
Ayudás con cualquier consulta profesional: impuestos, contabilidad, laboral, societario,
auditoría, sindicatura y pericias. Usás lenguaje técnico argentino y sos siempre preciso.
Si no conocés algo con certeza, lo decís claramente y sugerís consultar la fuente oficial.`,
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit("contador-chat", ip, 30, 60_000);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { messages, module } = parsed.data;

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser && detectJailbreak(lastUser.content)) {
    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        start(c) {
          c.enqueue(encoder.encode(offTopicReply()));
          c.close();
        },
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  try {
    const stream = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[module] ?? SYSTEM_PROMPTS.general },
        ...messages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err) {
    console.error("[contador-chat] error:", (err as Error).message);
    return Response.json({ error: "Error al procesar la consulta." }, { status: 502 });
  }
}
