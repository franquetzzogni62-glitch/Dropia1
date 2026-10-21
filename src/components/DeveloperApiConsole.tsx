import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Key,
  Webhook,
  CheckCircle,
  Copy,
  Clock,
  ArrowRight,
  Send,
  Database
} from 'lucide-react';
import type { ApiKeyItem, WebhookConfig } from '../types';

interface DeveloperApiConsoleProps {
  apiKeysList: ApiKeyItem[];
  webhooksList: WebhookConfig[];
}

export const DeveloperApiConsole: React.FC<DeveloperApiConsoleProps> = ({
  apiKeysList,
  webhooksList
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/v1/health');
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST'>('GET');
  const [requestUrl, setRequestUrl] = useState<string>('/api/v1/health');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [apiKeyHeader, setApiKeyHeader] = useState<string>('dp_live_8f3a981240184bba');

  // Response output state
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseJson, setResponseJson] = useState<string | null>(null);

  // New API key generation
  const [newKeyName, setNewKeyName] = useState('Boutique WooCommerce Abidjan');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Webhook dispatch test
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/demo-dropia');
  const [webhookEvent, setWebhookEvent] = useState('colis.livre');
  const [webhookResult, setWebhookResult] = useState<any>(null);

  const presetEndpoints = [
    {
      label: 'Health Check API',
      method: 'GET' as const,
      url: '/api/v1/health',
      body: ''
    },
    {
      label: 'Statistiques Opérationnelles',
      method: 'GET' as const,
      url: '/api/v1/stats',
      body: ''
    },
    {
      label: 'Liste des Colis (API REST)',
      method: 'GET' as const,
      url: '/api/v1/colis',
      body: ''
    },
    {
      label: 'Création de Colis via API',
      method: 'POST' as const,
      url: '/api/v1/colis',
      body: JSON.stringify(
        {
          nomClient: 'Koffi Germain',
          telephoneClient: '+225 07 88 99 00 11',
          ville: 'Abidjan',
          commune: 'Marcory Zone 4',
          adresse: 'Rue du 7 Décembre, Immeuble Ivoire',
          montantCOD: 32000,
          fraisLivraison: 2000,
          merchantId: 'mch_abidjan_01'
        },
        null,
        2
      )
    },
    {
      label: 'Vérification Clé API (dp_live_...)',
      method: 'POST' as const,
      url: '/api/v1/auth/api-key/verify',
      body: JSON.stringify({ cle: 'dp_live_8f3a981240184bba' }, null, 2)
    },
    {
      label: 'Statut Passerelle Mobile Money',
      method: 'GET' as const,
      url: '/api/saspay/health',
      body: ''
    },
    {
      label: 'Transactions Mobile Money',
      method: 'GET' as const,
      url: '/api/saspay/transactions',
      body: ''
    }
  ];

  const handleSelectPreset = (preset: typeof presetEndpoints[0]) => {
    setRequestMethod(preset.method);
    setRequestUrl(preset.url);
    setRequestBody(preset.body || '{}');
    setSelectedEndpoint(`${preset.method} ${preset.url}`);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseJson(null);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          'X-Dropia-Api-Key': apiKeyHeader
        }
      };

      if (requestMethod === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(requestUrl, options);
      const elapsed = Math.round(performance.now() - start);
      setResponseStatus(res.status);
      setResponseTime(elapsed);

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setResponseJson(JSON.stringify(data, null, 2));
      } catch {
        setResponseJson(text);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setResponseStatus(500);
      setResponseTime(elapsed);
      setResponseJson(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = () => {
    const raw = `dp_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    setGeneratedKey(raw);
  };

  const handleDispatchWebhook = async () => {
    try {
      const res = await fetch('/api/v1/webhooks/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          evenement: webhookEvent,
          trackingNumber: 'DP-CI-849201'
        })
      });
      const data = await res.json();
      setWebhookResult(data);
    } catch (err: any) {
      setWebhookResult({ succes: false, erreur: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Console Développeur API REST & Webhooks</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              v1.0 Serveur Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Testez en direct les routes HTTP du serveur Vite, validez vos clés secrètes et simulez des flux de webhooks e-commerce.
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 text-xs">
        {presetEndpoints.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(preset)}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              requestUrl === preset.url && requestMethod === preset.method
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
              {preset.method}
            </span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Interactive Request Builder & Response Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Side */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Requête HTTP</h3>
            <span className="text-xs text-slate-400">Exécution côté serveur</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Method & URL */}
            <div className="flex gap-2">
              <select
                value={requestMethod}
                onChange={(e) => setRequestMethod(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>

              <input
                type="text"
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                placeholder="/api/v1/health"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* API Key Header */}
            <div>
              <label className="block text-slate-400 mb-1">En-tête X-Dropia-Api-Key :</label>
              <input
                type="text"
                value={apiKeyHeader}
                onChange={(e) => setApiKeyHeader(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Body if POST */}
            {requestMethod === 'POST' && (
              <div>
                <label className="block text-slate-400 mb-1">Corps JSON (Payload) :</label>
                <textarea
                  rows={8}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-amber-300/90 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <button
              onClick={handleExecuteRequest}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isLoading ? 'Exécution de la requête...' : 'Envoyer la Requête'}
            </button>
          </div>
        </div>

        {/* Response Side */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Réponse HTTP du Serveur</h3>
              {responseStatus !== null && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {responseTime} ms
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3">
              {responseJson ? (
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400/90 font-mono text-xs overflow-x-auto max-h-[350px]">
                  {responseJson}
                </pre>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs">
                  Cliquez sur "Envoyer la Requête" pour voir le retour JSON direct.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Key Generator & Webhook Sender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Key Generator */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-white text-sm">Générateur de Clé API REST (Plan Business)</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Nom de l'application cliente :</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleGenerateKey}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
            >
              Générer une Clé de Production
            </button>

            {generatedKey && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  Nouvelle Clé API Générée (Sauvegardez-la) :
                </span>
                <div className="font-mono text-xs text-white break-all flex items-center justify-between">
                  <span>{generatedKey}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedKey)}
                    className="p-1 text-amber-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Webhooks Dispatcher */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4 text-blue-400" />
            <h4 className="font-bold text-white text-sm">Simulateur de Webhook Sortant</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">URL Endpoint Webhook :</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Événement déclencheur :</label>
              <select
                value={webhookEvent}
                onChange={(e) => setWebhookEvent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="colis.cree">colis.cree</option>
                <option value="colis.ramasse">colis.ramasse</option>
                <option value="colis.livre">colis.livre (Succès COD)</option>
                <option value="colis.annule">colis.annule</option>
              </select>
            </div>

            <button
              onClick={handleDispatchWebhook}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Émettre la Notification Webhook
            </button>

            {webhookResult && (
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(webhookResult, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
