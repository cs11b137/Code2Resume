import { z } from 'zod';

export const generateRequestSchema = z.object({
  projectName: z.string().trim().min(1),
  techStack: z.string().trim().optional().default(''),
  material: z.string().trim().min(1),
  count: z.number().int().min(1).max(12).optional().default(6),
  language: z.enum(['zh', 'en']).optional().default('zh'),
  style: z.enum(['aggressive', 'balanced', 'conservative']).optional().default('balanced'),
});

export const fetchMaterialRequestSchema = z.object({
  repo: z.string().trim().min(1),
  token: z.string().trim().optional().default(''),
  commitCount: z.number().int().min(1).max(50).optional().default(20),
  prCount: z.number().int().min(0).max(50).optional().default(20),
});

export const starSchema = z.object({
  situation: z.string(),
  task: z.string(),
  action: z.string(),
  result: z.string(),
});

export const generateResponseSchema = z.object({
  bullets: z.array(z.string()),
  stars: z.array(starSchema),
  skills: z.array(z.string()),
  metrics: z.array(z.string()),
  risks: z.array(z.string()),
  assumptions: z.array(z.string()),
  missing_info_questions: z.array(z.string()),
  meta: z.object({
    language: z.enum(['zh', 'en']),
    style: z.enum(['aggressive', 'balanced', 'conservative']),
    createdAt: z.string(),
    model: z.string(),
    mockMode: z.boolean(),
  }),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type GenerateResponse = z.infer<typeof generateResponseSchema>;
