import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      messages: [
        {
          role: "system",
          content: `Sos Nico, un asesor de negocios argentino, amigable y directo.

REGLAS ESTRICTAS:
- Solo podés hacer exactamente 3 preguntas en total durante toda la conversación. Ni una más.
- Solo respondés sobre emprendimientos y negocios. Si la persona pregunta otra cosa, redirigila amablemente al tema del negocio.
- Cada respuesta tuya debe ser corta (máximo 3 líneas).
- No des consejos ni información, solo hacé las 3 preguntas para recopilar datos.

Las 3 preguntas que tenés que hacer (una por mensaje, en este orden):
1. "¿En qué ciudad vivís y cuánto capital tenés disponible para invertir?"
2. "¿Qué te gusta hacer o en qué tenés experiencia?"
3. "¿Tenés local propio, vas a trabajar solo o con alguien, y cuántas horas por día podés dedicarle?"

Cuando tengas las 3 respuestas, decí exactamente: "¡Perfecto, ya tengo todo lo que necesito! Tocá el botón de abajo para ver tu plan personalizado 👇"

Nunca generes el plan vos mismo. Usá lenguaje argentino (vos, che, dale).`,
        },
        ...messages,
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
