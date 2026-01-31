import type { CollectionEntry } from 'astro:content'
import { getCollection, render } from 'astro:content'
import { defaultLocale } from '@/config'
import { memoize } from '@/utils/cache'

export type Post = CollectionEntry<'posts'> & {
  remarkPluginFrontmatter: {
    minutes: number
  }
}

// Helper functions for categorized tags
export function getAllTagsFromCategorized(tags: { topics?: string[], projects?: string[], types?: string[] } | undefined): string[] {
  if (!tags)
    return []
  return [
    ...(tags.topics || []),
    ...(tags.projects || []),
    ...(tags.types || []),
  ]
}

export function hasTag(tags: { topics?: string[], projects?: string[], types?: string[] } | undefined, tag: string): boolean {
  if (!tags)
    return false
  return [
    ...(tags.topics || []),
    ...(tags.projects || []),
    ...(tags.types || []),
  ].includes(tag)
}

const metaCache = new Map<string, { minutes: number }>()

/**
 * Add metadata including reading time to a post
 *
 * @param post The post to enhance with metadata
 * @returns Enhanced post with reading time information
 */
async function addMetaToPost(post: CollectionEntry<'posts'>): Promise<Post> {
  const cacheKey = `${post.id}-${post.data.lang || 'universal'}`

  if (metaCache.has(cacheKey)) {
    return {
      ...post,
      remarkPluginFrontmatter: metaCache.get(cacheKey)!,
    }
  }

  const { remarkPluginFrontmatter } = await render(post)
  metaCache.set(cacheKey, remarkPluginFrontmatter as { minutes: number })

  return {
    ...post,
    remarkPluginFrontmatter: metaCache.get(cacheKey)!,
  }
}

/**
 * Find duplicate post slugs within the same language
 *
 * @param posts Array of blog posts to check
 * @returns Array of descriptive error messages for duplicate slugs
 */
async function _checkPostSlugDuplication(posts: CollectionEntry<'posts'>[]): Promise<string[]> {
  const slugMap = new Map<string, Set<string>>()
  const duplicates: string[] = []

  posts.forEach((post) => {
    const lang = post.data.lang
    const slug = post.data.abbrlink || post.id

    if (!slugMap.has(lang)) {
      slugMap.set(lang, new Set())
    }

    const slugSet = slugMap.get(lang)!
    if (!slugSet.has(slug)) {
      slugSet.add(slug)
      return
    }

    if (!lang) {
      duplicates.push(`Duplicate slug "${slug}" found in universal post (applies to all languages)`)
    }
    else {
      duplicates.push(`Duplicate slug "${slug}" found in "${lang}" language post`)
    }
  })

  return duplicates
}

export const checkPostSlugDuplication = memoize(_checkPostSlugDuplication)

/**
 * Get all posts (including pinned ones, excluding drafts in production)
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Posts filtered by language, enhanced with metadata, sorted by date
 */
async function _getPosts(lang?: string) {
  const currentLang = lang || defaultLocale

  const filteredPosts = await getCollection(
    'posts',
    ({ data }: CollectionEntry<'posts'>) => {
      // Show drafts in dev mode only
      const shouldInclude = import.meta.env.DEV || !data.draft
      return shouldInclude && (data.lang === currentLang || data.lang === '')
    },
  )

  const enhancedPosts = await Promise.all(filteredPosts.map(addMetaToPost))

  return enhancedPosts.sort((a: Post, b: Post) =>
    b.data.published.valueOf() - a.data.published.valueOf(),
  )
}

export const getPosts = memoize(_getPosts)

/**
 * Get all non-pinned posts
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Regular posts (non-pinned), filtered by language
 */
async function _getRegularPosts(lang?: string) {
  const posts = await getPosts(lang)
  return posts.filter(post => !post.data.pin)
}

export const getRegularPosts = memoize(_getRegularPosts)

/**
 * Get pinned posts sorted by pin priority
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Pinned posts sorted by pin value in descending order
 */
async function _getPinnedPosts(lang?: string) {
  const posts = await getPosts(lang)
  return posts
    .filter(post => post.data.pin && post.data.pin > 0)
    .sort((a, b) => (b.data.pin ?? 0) - (a.data.pin ?? 0))
}

export const getPinnedPosts = memoize(_getPinnedPosts)

/**
 * Group posts by year and sort within each year
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Map of posts grouped by year (descending), sorted by date within each year
 */
async function _getPostsByYear(lang?: string): Promise<Map<number, Post[]>> {
  const posts = await getRegularPosts(lang)
  const yearMap = new Map<number, Post[]>()

  posts.forEach((post: Post) => {
    const year = post.data.published.getFullYear()
    if (!yearMap.has(year)) {
      yearMap.set(year, [])
    }
    yearMap.get(year)!.push(post)
  })

  // Sort posts within each year by date
  yearMap.forEach((yearPosts) => {
    yearPosts.sort((a, b) => {
      const aDate = a.data.published
      const bDate = b.data.published
      return bDate.getMonth() - aDate.getMonth() || bDate.getDate() - aDate.getDate()
    })
  })

  return new Map([...yearMap.entries()].sort((a, b) => b[0] - a[0]))
}

export const getPostsByYear = memoize(_getPostsByYear)

/**
 * Group posts by their tags
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Map where keys are tag names and values are arrays of posts with that tag
 */
async function _getPostsGroupByTags(lang?: string) {
  const posts = await getPosts(lang)
  const tagMap = new Map<string, Post[]>()

  posts.forEach((post: Post) => {
    const allTags = getAllTagsFromCategorized(post.data.tags)
    allTags.forEach((tag: string) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, [])
      }
      tagMap.get(tag)!.push(post)
    })
  })

  return tagMap
}

export const getPostsGroupByTags = memoize(_getPostsGroupByTags)

/**
 * Get all tags sorted by post count
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Array of tags sorted by popularity (most posts first)
 */
async function _getAllTags(lang?: string) {
  const tagMap = await getPostsGroupByTags(lang)
  const tagsWithCount = Array.from(tagMap.entries())

  tagsWithCount.sort((a, b) => b[1].length - a[1].length)
  return tagsWithCount.map(([tag]) => tag)
}

export const getAllTags = memoize(_getAllTags)

/**
 * Get all posts that contain a specific tag
 *
 * @param tag The tag name to filter posts by
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Array of posts that contain the specified tag
 */
async function _getPostsByTag(tag: string, lang?: string) {
  const tagMap = await getPostsGroupByTags(lang)
  return tagMap.get(tag) ?? []
}

export const getPostsByTag = memoize(_getPostsByTag)

/**
 * Check which languages support a specific tag
 *
 * @param tag The tag name to check language support for
 * @returns Array of language codes that support the specified tag
 */
async function _getTagSupportedLangs(tag: string) {
  const posts = await getCollection(
    'posts',
    ({ data }) => !data.draft,
  )
  const { allLocales } = await import('@/config')

  return allLocales.filter(locale =>
    posts.some(post =>
      hasTag(post.data.tags, tag)
      && (post.data.lang === locale || post.data.lang === ''),
    ),
  )
}

export const getTagSupportedLangs = memoize(_getTagSupportedLangs)

// ================================== PROJECTS ==================================

export type Project = CollectionEntry<'projects'> & {
  remarkPluginFrontmatter: {
    minutes: number
  }
}

/**
 * Add metadata including reading time to a project
 *
 * @param project The project to enhance with metadata
 * @returns Enhanced project with reading time information
 */
async function addMetaToProject(project: CollectionEntry<'projects'>): Promise<Project> {
  const cacheKey = `project-${project.id}-${project.data.lang || 'universal'}`

  if (metaCache.has(cacheKey)) {
    return {
      ...project,
      remarkPluginFrontmatter: metaCache.get(cacheKey)!,
    }
  }

  const { remarkPluginFrontmatter } = await render(project)
  metaCache.set(cacheKey, remarkPluginFrontmatter as { minutes: number })

  return {
    ...project,
    remarkPluginFrontmatter: metaCache.get(cacheKey)!,
  }
}

/**
 * Get all published projects
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns All published projects with metadata, sorted by publication date
 */
async function _getProjects(lang?: string): Promise<Project[]> {
  const projects = await getCollection('projects', entry => !entry.data.draft)

  const mappedProjects = await Promise.all(
    projects.map(project => addMetaToProject(project)),
  )

  const filteredProjects = mappedProjects.filter(project =>
    project.data.lang === lang || project.data.lang === '' || !lang,
  )

  return filteredProjects.sort((a, b) => {
    const dateA = new Date(a.data.published)
    const dateB = new Date(b.data.published)
    return dateB.getTime() - dateA.getTime()
  })
}

export const getProjects = memoize(_getProjects)

/**
 * Get all non-pinned projects
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Regular projects (non-pinned), filtered by language
 */
async function _getRegularProjects(lang?: string) {
  const projects = await getProjects(lang)
  return projects.filter(project => !project.data.pin)
}

export const getRegularProjects = memoize(_getRegularProjects)

/**
 * Get pinned projects sorted by pin priority
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Pinned projects sorted by pin value in descending order
 */
async function _getPinnedProjects(lang?: string) {
  const projects = await getProjects(lang)
  return projects
    .filter(project => project.data.pin && project.data.pin > 0)
    .sort((a, b) => (b.data.pin ?? 0) - (a.data.pin ?? 0))
}

export const getPinnedProjects = memoize(_getPinnedProjects)

/**
 * Group projects by year of publication
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Map of years to projects published in that year
 */
async function _getProjectsByYear(lang?: string) {
  const projects = await getRegularProjects(lang)
  const projectsByYear = new Map<number, Project[]>()

  projects.forEach((project) => {
    const year = new Date(project.data.published).getFullYear()
    if (!projectsByYear.has(year)) {
      projectsByYear.set(year, [])
    }
    projectsByYear.get(year)!.push(project)
  })

  // Sort years in descending order
  return new Map([...projectsByYear.entries()].sort((a, b) => b[0] - a[0]))
}

export const getProjectsByYear = memoize(_getProjectsByYear)

/**
 * Group projects by tags they contain
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Map of tag names to arrays of projects containing that tag
 */
async function _getProjectsGroupByTags(lang?: string): Promise<Map<string, Project[]>> {
  const projects = await getProjects(lang)
  const tagMap = new Map<string, Project[]>()

  projects.forEach((project: Project) => {
    const allTags = getAllTagsFromCategorized(project.data.tags)
    allTags.forEach((tag: string) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, [])
      }
      tagMap.get(tag)!.push(project)
    })
  })

  // Sort projects within each tag by date (newest first)
  tagMap.forEach((projects) => {
    projects.sort((a, b) => {
      const dateA = new Date(a.data.published)
      const dateB = new Date(b.data.published)
      return dateB.getTime() - dateA.getTime()
    })
  })

  return tagMap
}

export const getProjectsGroupByTags = memoize(_getProjectsGroupByTags)

/**
 * Get all unique project tags sorted by project count
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Array of tag names sorted by number of projects (descending)
 */
async function _getAllProjectTags(lang?: string): Promise<string[]> {
  const tagMap = await getProjectsGroupByTags(lang)
  const tagsWithCount = Array.from(tagMap.entries())

  // Sort by project count (descending)
  tagsWithCount.sort((a, b) => b[1].length - a[1].length)

  return tagsWithCount.map(([tag]) => tag)
}

export const getAllProjectTags = memoize(_getAllProjectTags)

/**
 * Get all projects that contain a specific tag
 *
 * @param tag The tag name to filter projects by
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Array of projects that contain the specified tag
 */
async function _getProjectsByTag(tag: string, lang?: string): Promise<Project[]> {
  const tagMap = await getProjectsGroupByTags(lang)
  return tagMap.get(tag) ?? []
}

export const getProjectsByTag = memoize(_getProjectsByTag)

/**
 * Get all unique tags from both posts and projects, sorted by total content count
 *
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Array of tag names sorted by total content count (descending)
 */
async function _getAllCombinedTags(lang?: string): Promise<string[]> {
  const [postTags, projectTags] = await Promise.all([
    getPostsGroupByTags(lang),
    getProjectsGroupByTags(lang),
  ])

  const combinedTagCounts = new Map<string, number>()

  // Count posts for each tag
  postTags.forEach((posts, tag) => {
    combinedTagCounts.set(tag, (combinedTagCounts.get(tag) || 0) + posts.length)
  })

  // Count projects for each tag
  projectTags.forEach((projects, tag) => {
    combinedTagCounts.set(tag, (combinedTagCounts.get(tag) || 0) + projects.length)
  })

  // Sort by total count (descending)
  const tagsWithCount = Array.from(combinedTagCounts.entries())
  tagsWithCount.sort((a, b) => b[1] - a[1])

  return tagsWithCount.map(([tag]) => tag)
}

export const getAllCombinedTags = memoize(_getAllCombinedTags)

/**
 * Get all content (posts and projects) that contain a specific tag
 *
 * @param tag The tag name to filter content by
 * @param lang The language code to filter by, defaults to site's default language
 * @returns Object with posts and projects arrays that contain the specified tag
 */
async function _getContentByTag(tag: string, lang?: string): Promise<{ posts: Post[], projects: Project[] }> {
  const [posts, projects] = await Promise.all([
    getPostsByTag(tag, lang),
    getProjectsByTag(tag, lang),
  ])

  return { posts, projects }
}

export const getContentByTag = memoize(_getContentByTag)

/**
 * Check which languages support a specific tag across both posts and projects
 *
 * @param tag The tag name to check language support for
 * @returns Array of language codes that support the specified tag
 */
async function _getCombinedTagSupportedLangs(tag: string): Promise<string[]> {
  const [posts, projects] = await Promise.all([
    getCollection('posts', ({ data }) => !data.draft),
    getCollection('projects', ({ data }) => !data.draft),
  ])
  const { allLocales } = await import('@/config')

  return allLocales.filter((locale) => {
    const hasPostsWithTag = posts.some(post =>
      hasTag(post.data.tags, tag)
      && (post.data.lang === locale || post.data.lang === ''),
    )

    const hasProjectsWithTag = projects.some(project =>
      hasTag(project.data.tags, tag)
      && (project.data.lang === locale || project.data.lang === ''),
    )

    return hasPostsWithTag || hasProjectsWithTag
  })
}

export const getCombinedTagSupportedLangs = memoize(_getCombinedTagSupportedLangs)
