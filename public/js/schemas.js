const z = window.Zod;

export const heroStateSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  kicker: z.string().min(1),
  primaryCta: z.string().min(1),
  secondaryCta: z.string().min(1),
  liveBadge: z.string().min(1),
  metricA: z.string().min(1),
  metricB: z.string().min(1),
  sentiment: z.string().min(1)
});

export const heroPayloadSchema = z.object({
  hero: heroStateSchema
});
