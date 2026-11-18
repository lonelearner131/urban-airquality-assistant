/**
 * @fileoverview Zod schema for grounded follow-up chat interactions.
 * Restricts payload size and validates conversational context boundaries.
 */

import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(300),
});

export const ChatContextSnapshotSchema = z.object({
  locationName: z.string().max(100),
  aqi: z.number(),
  riskTier: z.string().max(20),
  summary: z.string().max(400),
  language: z.enum(["en", "hi"]).default("en"),
});

export const ChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, "Question too short")
    .max(300, "Question exceeds 300 characters"),
  context: ChatContextSnapshotSchema,
  history: z.array(ChatMessageSchema).max(6).default([]),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatContextSnapshot = z.infer<typeof ChatContextSnapshotSchema>;
