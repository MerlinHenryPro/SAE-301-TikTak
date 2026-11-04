import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

try { process.loadEnvFile('.env'); } catch {}

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: { checkOrigin: false },
  server: { host: true, port: Number(process.env.PORT) || 4321 },
  vite: {
    plugins: [tailwindcss()],
    ssr: { external: ['better-sqlite3'] },
  },
});
