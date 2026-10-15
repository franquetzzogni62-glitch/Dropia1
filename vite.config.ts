import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

/**
 * Plugin serveur pour les routes API REST v1 & Webhooks Dropia (dev server uniquement).
 * Autonome et sans import de ./src pour garantir un bundling sans erreur de vite.config.ts.
 */
function dropiaRestApiPlugin(): Plugin {
  return {
    name: 'dropia-rest-api-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/v1/dropia')) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ succes: true, message: 'Dropia REST API v1 Online' }));
          return;
        }
        next();
      });
    },
  };
}

/**
 * Plugin serveur pour les routes API SasPay (dev server uniquement).
 * Autonome et sans import de ./src pour garantir un bundling sans erreur de vite.config.ts.
 */
function saspayApiPlugin(): Plugin {
  return {
    name: 'saspay-api-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/saspay')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        if (url === '/api/saspay/health') {
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            service: 'SasPay Gateway Bridge (Dropia)',
            status: 'ONLINE',
            currency: 'XOF'
          }));
          return;
        }

        if (url === '/api/saspay/transactions') {
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            count: 0,
            transactions: []
          }));
          return;
        }

        if (url === '/api/saspay/create-payment') {
          const txId = `sas_tx_${Date.now().toString().slice(-4)}`;
          const refSas = `SAS-WAVE-${Date.now().toString().slice(-6)}`;
          res.statusCode = 201;
          res.end(JSON.stringify({
            success: true,
            transactionId: txId,
            reference: refSas,
            montant: 50000,
            devise: 'XOF',
            statut: 'PENDING',
            paymentUrl: `https://checkout.saspay.me/pay/${refSas}`,
            instructions: 'Simulation USSD Mobile Money envoyée avec succès.'
          }));
          return;
        }

        if (url === '/api/saspay/webhook') {
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            message: 'Webhook SasPay traité'
          }));
          return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
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
