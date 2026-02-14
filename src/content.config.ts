import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['tech', 'review', 'log']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    canonicalURL: z.string().url().optional(),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    aiSummary: z.string().optional(),
  }),
});

export const collections = { posts };
