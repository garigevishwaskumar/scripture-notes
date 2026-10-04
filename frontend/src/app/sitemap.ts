import type { MetadataRoute } from 'next';
import { ALL_BOOKS } from '@/lib/bible';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://biblenotetaker.vercel.app';

  const bookRoutes: MetadataRoute.Sitemap = ALL_BOOKS.map((book) => ({
    url: `${baseUrl}/bible/${book.id}/1`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...bookRoutes,
  ];
}
