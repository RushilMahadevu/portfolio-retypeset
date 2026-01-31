import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'
import { allLocales, themeConfig } from '@/config'

// Tag categories for better organization
const tagCategories = z.object({
  topics: z.array(z.string()).optional().default([]), // philosophy, psychology, etc.
  projects: z.array(z.string()).optional().default([]), // project-specific tags
  types: z.array(z.string()).optional().default([]), // introduction, tutorial, etc.
})

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    // required
    title: z.string(),
    published: z.date(),
    // optional
    description: z.string().optional().default(''),
    updated: z.preprocess(
      val => val === '' ? undefined : val,
      z.date().optional(),
    ),
    // New categorized tags system
    tags: tagCategories.optional().default({}),
    // Legacy tags support (for backward compatibility)
    legacyTags: z.array(z.string()).optional().default([]),
    // Advanced
    draft: z.boolean().optional().default(false),
    pin: z.number().int().min(0).max(99).optional().default(0),
    toc: z.boolean().optional().default(themeConfig.global.toc),
    lang: z.enum(['', ...allLocales]).optional().default(''),
    abbrlink: z.string().optional().default('').refine(
      abbrlink => !abbrlink || /^[a-z0-9\-]*$/.test(abbrlink),
      { message: 'Abbrlink can only contain lowercase letters, numbers and hyphens' },
    ),
  }),
})

const about = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/about' }),
  schema: z.object({
    lang: z.enum(['', ...allLocales]).optional().default(''),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    // required
    title: z.string(),
    published: z.date(),
    // optional
    description: z.string().optional().default(''),
    updated: z.preprocess(
      val => val === '' ? undefined : val,
      z.date().optional(),
    ),
    // New categorized tags system
    tags: tagCategories.optional().default({}),
    // Legacy tags support (for backward compatibility)
    legacyTags: z.array(z.string()).optional().default([]),
    // project-specific fields
    image: z.string().optional(),
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    status: z.enum(['completed', 'in-progress', 'planned']).optional().default('completed'),
    // Advanced
    draft: z.boolean().optional().default(false),
    pin: z.number().int().min(0).max(99).optional().default(0),
    toc: z.boolean().optional().default(themeConfig.global.toc),
    lang: z.enum(['', ...allLocales]).optional().default(''),
    abbrlink: z.string().optional().default('').refine(
      abbrlink => !abbrlink || /^[a-z0-9\-]*$/.test(abbrlink),
      { message: 'Abbrlink can only contain lowercase letters, numbers and hyphens' },
    ),
  }),
})

export const collections = { posts, about, projects }
