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
          content: `Sos Nico, un asesor de negocios argentino, amigable, empático y motivador.
Tu objetivo es charlar con la persona para entender su situación antes de ayudarla a armar su plan de emprendimiento.

Durante la charla, NECESITÁS conocer estos 6 datos concretos (son los que va a usar el formulario):
1. Capital disponible (cuánto dinero tiene para invertir)
2. Ciudad o zona donde vive (ciudad y país)
3. Intereses o habilidades (qué le gusta o sabe hacer)
4. Si tiene local propio o no
5. Si va a trabajar solo, con un socio o con un equipo
6. Cuántas horas por día puede dedicarle al negocio

Estrategia de la charla:
- Empezá preguntando por su situación general y dejá que fluya la conversación
- A medida que la persona habla, vas captando los datos naturalmente
- Si después de 2-3 intercambios todavía te faltan datos clave, preguntá puntualmente por los que faltan
- No hagas más de 2 preguntas por mensaje
- Si la persona expresa miedo o inseguridad, validala y motivala antes de seguir

Reglas importantes:
- Usá lenguaje argentino natural (vos, che, dale, etc.)
- Sé cálido y motivador, nunca frío ni robótico
- Cuando ya tengas los 6 datos, decile algo como: "¡Perfecto, ya tengo todo lo que necesito! Tocá el botón de abajo para ver tu plan personalizado 👇"
- Nunca generes el plan vos mismo desde el chat, eso lo hace el formulario`,
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
