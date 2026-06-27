import type { APIRoute } from 'astro';

// Dynamic robots.txt so the Sitemap URL always tracks the deployed origin +
// base (github.io/MIME-Website now, the real domain later) with no manual edit.
// Note: on a project Pages subpath this serves at /MIME-Website/robots.txt;
// crawlers only honour robots at the domain root, so it becomes authoritative
// once the site moves to its own root domain.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL; // '/MIME-Website/' on Pages, '/' otherwise
  const sitemapUrl = new URL(`${base}sitemap-index.xml`.replace(/\/{2,}/g, '/'), site);
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl.href}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
