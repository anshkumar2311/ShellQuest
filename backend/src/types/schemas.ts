import { z } from "zod";

export const MessageSchema = z.object({
  content: z.string(),
  timestamp: z.iso.datetime(),
  role: z.enum(["user", "ai", "system"])
});

export type Message = z.infer<typeof MessageSchema>;

const BaseHeatmapActivitySchema = z.object({
  title: z.string(),
  detail: z.string(),
  badge: z.string(),
  date: z.string().datetime().or(z.date()),
});

export const QuizHeatmapActivitySchema = BaseHeatmapActivitySchema.extend({
  type: z.literal("quiz"),
  quizId: z.string().optional(),
  score: z.number().optional()
});

export const TaskHeatmapActivitySchema = BaseHeatmapActivitySchema.extend({
  type: z.literal("task"),
  taskId: z.string().optional()
});

export const AiHeatmapActivitySchema = BaseHeatmapActivitySchema.extend({
  type: z.literal("ai"),
  chatId: z.string().optional()
});

export const BadgeHeatmapActivitySchema = BaseHeatmapActivitySchema.extend({
  type: z.literal("badge"),
  badgeId: z.string().optional()
});

export const ChallengeHeatmapActivitySchema = BaseHeatmapActivitySchema.extend({
  type: z.literal("challenge"),
  challengeId: z.string().optional()
});

export const HeatmapActivitySchema = z.discriminatedUnion("type", [
  QuizHeatmapActivitySchema,
  TaskHeatmapActivitySchema,
  AiHeatmapActivitySchema,
  BadgeHeatmapActivitySchema,
  ChallengeHeatmapActivitySchema
]);

export type HeatmapActivity = z.infer<typeof HeatmapActivitySchema>;
