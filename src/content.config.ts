import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  zone: z.enum(['android', 'fullstack', 'ai-tools']),
  status: z.enum(['active', 'completed', 'archived']),
  date: z.string(),
  color: z.string(),
  hasImages: z.boolean(),
  githubUrl: z.string(),
  demoUrl: z.string(),
  linkedinUrl: z.string(),
  stack: z.array(z.string()),
  description: z.object({
    es: z.string(),
    en: z.string(),
  }),
  videos: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })).optional(),
});

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
    schema: projectSchema,
  }),
};
