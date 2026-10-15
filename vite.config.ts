import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleDropiaApiRequest } from './src/server/dropiaRestApi';
import { handleSaspayRequest } from './src/server/saspayServer';

/**
 * Plugin serveur pour les routes API REST v1 & Webhooks Dropia
 */
function dropiaRestApiPlugin(): Plugin {
  return {
    name: 'dropia-rest-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleDropiaApiRequest(req, res);
          if (!handled) {
            next();
          }
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(500);
          res.end(JSON.stringify({ succes: false, erreur: 'ERREUR_SERVEUR', message: err.message }));
        }
      });
    },
  };
}

/**
 * Plugin serveur pour les routes API SasPay (https://docs.saspay.me/)
 * Sécurise l'exécution de la clé secrète sk_live côté serveur & webhooks
 */
function saspayApiPlugin(): Plugin {
  return {
    name: 'saspay-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleSaspayRequest(req, res);
          if (!handled) {
            next();
          }
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), saspayApiPlugin(), dropiaRestApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
