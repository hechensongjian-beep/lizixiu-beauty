import { MetadataRoute } from 'next';

const BASE_URL = 'https://lizixiu-beauty.pages.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '', '/products', '/services', '/appointments',
    '/auth/login', '/auth/register',
  ];

  return routes.map(route => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
