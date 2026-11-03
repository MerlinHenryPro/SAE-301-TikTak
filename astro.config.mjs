// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// Charge .env dans process.env (dev et build)
try { process.loadEnvFile('.env'); } catch {}

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // L'origine des requêtes POST est vérifiée dans src/middleware.js
  // (compatible avec le reverse proxy Nginx du VPS)
  security: { checkOrigin: false },
  server: { host: true, port: Number(process.env.PORT) || 4321 },
  vite: {
    plugins: [tailwindcss()],
    ssr: { external: ['better-sqlite3'] },
  },
});
