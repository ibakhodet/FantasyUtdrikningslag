import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repoet er på https://github.com/ibakhodet/FantasyUtdrikningslag, så
// GitHub Pages serverer på /FantasyUtdrikningslag/. Lokalt (npm run dev)
// trenger vi ikke noe prefix.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/FantasyUtdrikningslag/' : '/',
  server: { host: true, port: 5173 },
}));
