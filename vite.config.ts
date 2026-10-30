import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Plugin para proyectos Vanilla HTML/CSS/JS estáticos:
 * Garantiza que al ejecutar `vite build` (en Vercel, GitHub Pages o AI Studio)
 * se copien íntegramente index.html, politica-de-privacidad.html, styles.css,
 * script.js, favicon.svg y la carpeta assets/ dentro de dist/ sin rutas rotas.
 */
function copyStaticSitePlugin() {
  return {
    name: 'copy-cosmos-tour-static',
    closeBundle() {
      const rootDir = process.cwd();
      const outDir = path.resolve(rootDir, 'dist');

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const staticFiles = [
        'index.html',
        'politica-de-privacidad.html',
        'styles.css',
        'script.js',
        'app.js',
        'favicon.svg',
        '.nojekyll'
      ];

      for (const file of staticFiles) {
        const srcPath = path.resolve(rootDir, file);
        const destPath = path.resolve(outDir, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }

      const assetsSrc = path.resolve(rootDir, 'assets');
      const assetsDest = path.resolve(outDir, 'assets');
      if (fs.existsSync(assetsSrc)) {
        fs.cpSync(assetsSrc, assetsDest, { recursive: true, force: true });
      }
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [copyStaticSitePlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {}
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  }
});
