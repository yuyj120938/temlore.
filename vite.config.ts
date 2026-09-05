import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites from /<repository-name>/.
// Keep local development at /, while deriving the Pages path in CI.
const [repositoryOwner, repositoryName] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const isUserSite = repositoryName && repositoryOwner
  ? repositoryName.toLowerCase() === `${repositoryOwner.toLowerCase()}.github.io`
  : false;
const base =
  process.env.VITE_BASE ??
  (process.env.GITHUB_ACTIONS && repositoryName
    ? isUserSite
      ? '/'
      : `/${repositoryName}/`
    : '/');

export default defineConfig({
  plugins: [react()],
  base,
  server: { port: 4173, proxy: { '/api': 'http://localhost:4174' } },
});
