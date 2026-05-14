import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(500),
});

export const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
});

export type ChatMessage = z.infer<typeof MessageSchema>;

export const ExtractRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
});

const ShortString = z.string().max(200);

export const IdeasRequestSchema = z.object({
  capital: ShortString,
  zona: ShortString,
  intereses: ShortString,
  localPropio: ShortString,
  modalidad: ShortString,
  horasDiarias: ShortString,
});

export const PlanRequestSchema = z.object({
  ideaElegida: ShortString,
  capital: ShortString,
  zona: ShortString,
  localPropio: ShortString,
});

export const PresupuestoRequestSchema = z.object({
  ideaElegida: ShortString,
  capital: ShortString,
  zona: ShortString,
  localPropio: ShortString,
});

export const ProveedoresRequestSchema = z.object({
  intereses: ShortString,
  zona: ShortString,
});

export const LocalRequestSchema = z.object({
  intereses: ShortString,
  zona: ShortString,
  localPropio: ShortString,
});
