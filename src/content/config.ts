import { defineCollection, z } from 'astro:content';

const menu = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    category: z.enum(['tea', 'coffee', 'snack', 'quick-bite']),
    price: z.number().int().nonnegative(),
    description: z.string().optional(),
    note: z.string().optional(),
    available: z.boolean().default(true),
    order: z.number().default(99),
    highlight: z.boolean().default(false),
  }),
});

export const collections = { menu };
