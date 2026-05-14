import { getGroq } from "@/app/lib/groq-client";
import { PlanRequestSchema } from "@/app/lib/schemas";
import {
  checkRateLimit,
  getClientIp,
  rateLimitedResponse,
} from "@/app/lib/rate-limit";


export async function POST(request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit("plan-accion", ip, 5, 60_000);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const parsed = PlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const { zona, ideaElegida, capital, localPropio } = parsed.data;

    const stream = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      max_tokens: 1800,
      messages: [
        {
          role: "user",
          content: `Sos un coach de negocios experto en Argentina (2026). Una persona acaba de decidir arrancar con este negocio:

**Negocio:** ${ideaElegida}
**Zona:** ${zona}
**Capital disponible:** ${capital}
**Tiene local propio:** ${localPropio === "si" ? "Sí" : "No"}

Creá un **plan de acción concreto y realista** dividido así:

## Semana 1 — Arrancar sin excusas
Lista de 5 a 7 tareas concretas para la primera semana. Cosas que puede hacer YA, con o sin local.

IMPORTANTE — proceso real para sacar el CUIT en Argentina:
- El CUIT se obtiene en AFIP (afip.gob.ar) o en una oficina de AFIP, presentando solo el DNI. No se necesita CV ni ningún otro documento. Es gratis y se puede hacer online o presencialmente. Si ya tiene DNI argentino, probablemente ya tenga CUIT asignado y solo necesita activarlo en el sitio de AFIP.
- Jamás menciones que hay que presentar un CV para sacar el CUIT. Eso es incorrecto.

Incluí tareas como: activar o sacar el CUIT en afip.gob.ar, abrir redes sociales del negocio, hablar con proveedores, etc.

## Semana 2 — Preparar el terreno
Lista de 5 a 7 tareas concretas. Avanzar con trámites, buscar local si no tiene, comprar stock inicial, etc.

## Semana 3 — Casi listo
Lista de tareas para dejarlo todo preparado para abrir.

## Semana 4 — Apertura
Checklist de apertura: qué revisar antes de abrir, cómo anunciar la apertura, primeras acciones de marketing.

## Mes 2 y 3 — Consolidación
Qué foco poner en los primeros meses para hacer crecer el negocio: conseguir clientes fijos, ajustar precios, reinvertir ganancias, etc.

## Errores más comunes en este rubro
3 a 5 errores típicos que cometen los que arrancan en este negocio y cómo evitarlos.

Sé muy concreto, usá lenguaje argentino, motivador pero realista. Cada tarea debe ser accionable (que empiece con un verbo: "Llamar a...", "Crear...", "Comprar...", etc.)`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
