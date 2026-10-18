import React, { useState } from 'react';
import {
  Database,
  Shield,
  Layers,
  Code2,
  CheckCircle,
  AlertTriangle,
  Lock,
  Copy,
  Terminal,
  FileText
} from 'lucide-react';
import blueprintConfig from '../../firebase-blueprint.json';

export const ArchitectureStudio: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'blueprint' | 'sql' | 'rules' | 'auditor'>('blueprint');
  const [selectedEntityKey, setSelectedEntityKey] = useState<string>('Agence');
  const [copied, setCopied] = useState(false);

  // Entities from firebase-blueprint.json
  const entities = blueprintConfig.entities as Record<string, any>;
  const currentEntity = entities[selectedEntityKey] || entities['Agence'];

  // PostgreSQL DDL representation for Dropia
  const postgresDdl = `-- =====================================================================
-- DROPIA ARCHITECTURE STUDIO : SCHEMA POSTGRESQL / SUPABASE
-- Conçu pour la logistique du dernier kilomètre en Afrique Francophone
-- =====================================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table des Agences 3PL (Abonnements & Hubs)
CREATE TABLE IF NOT EXISTS agences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    ville VARCHAR(100) NOT NULL DEFAULT 'Abidjan',
    pays VARCHAR(100) NOT NULL DEFAULT 'Côte d''Ivoire',
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('starter', 'pro', 'business')),
    plan_statut VARCHAR(50) NOT NULL DEFAULT 'actif',
    limite_colis INT NOT NULL DEFAULT 500,
    colis_utilises INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des E-commerçants / Boutiques
CREATE TABLE IF NOT EXISTS ecommercants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence_id UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
    nom_boutique VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    solde_cod_en_attente NUMERIC(12, 2) DEFAULT 0.00,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des Livreurs (Authentifiés par téléphone + PIN 4 chiffres)
CREATE TABLE IF NOT EXISTS livreurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agence_id UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL, -- Haché bcryptjs pour le code PIN à 4 chiffres
    zone VARCHAR(255) NOT NULL,
    vehicule VARCHAR(50) DEFAULT 'moto',
    actif BOOLEAN DEFAULT TRUE,
    taux_reussite NUMERIC(5, 2) DEFAULT 95.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des Colis et Commandes (Cash On Delivery COD)
CREATE TABLE IF NOT EXISTS colis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    agence_id UUID NOT NULL REFERENCES agences(id),
    ecommercant_id UUID NOT NULL REFERENCES ecommercants(id),
    livreur_id UUID REFERENCES livreurs(id),
    nom_client VARCHAR(255) NOT NULL,
    telephone_client VARCHAR(50) NOT NULL,
    commune VARCHAR(100) NOT NULL,
    adresse TEXT NOT NULL,
    montant_cod NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Montant en FCFA à encaisser
    frais_livraison NUMERIC(12, 2) NOT NULL DEFAULT 2000.00,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('en_attente', 'ramasse', 'en_cours', 'livre', 'annule', 'retourne')),
    code_otp VARCHAR(10), -- Code secret à 4 chiffres pour validation livraison
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index d'optimisation pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_colis_tracking ON colis(tracking_number);
CREATE INDEX IF NOT EXISTS idx_colis_agence_statut ON colis(agence_id, statut);
CREATE INDEX IF NOT EXISTS idx_colis_livreur ON colis(livreur_id);`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Studio */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Dropia Architecture Studio</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Modélisation des entités, mapping NoSQL Firestore vs PostgreSQL Supabase et vérification de la sécurité ABAC / RBAC.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('blueprint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeSubTab === 'blueprint'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Entités Firestore
          </button>
          <button
            onClick={() => setActiveSubTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeSubTab === 'sql'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Schéma PostgreSQL
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeSubTab === 'rules'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Règles firestore.rules
          </button>
          <button
            onClick={() => setActiveSubTab('auditor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeSubTab === 'auditor'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Audit de Sécurité
          </button>
        </div>
      </div>

      {/* Content depending on subtab */}
      {activeSubTab === 'blueprint' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Entity List */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Entités Modélisées ({Object.keys(entities).length})
            </span>
            <div className="space-y-1">
              {Object.keys(entities).map((key) => {
                const ent = entities[key];
                const isSelected = selectedEntityKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedEntityKey(key)}
                    className={`w-full text-left p-2.5 rounded-lg transition flex items-center justify-between text-xs font-medium ${
                      isSelected
                        ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <span>{ent.title || key}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Object.keys(ent.properties || {}).length} champs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Entity Details Viewer */}
          <div className="md:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  {currentEntity.title || selectedEntityKey}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentEntity.description}</p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                Collection Firestore: /{selectedEntityKey.toLowerCase()}s
              </span>
            </div>

            {/* Properties Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 uppercase text-[10px] text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Propriété</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Requis</th>
                    <th className="py-2.5 px-3">Contraintes & Enum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {Object.entries(currentEntity.properties || {}).map(([propKey, prop]: [string, any]) => {
                    const isRequired = (currentEntity.required || []).includes(propKey);
                    return (
                      <tr key={propKey} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{propKey}</td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{prop.type || 'string'}</td>
                        <td className="py-2.5 px-3">
                          {isRequired ? (
                            <span className="text-rose-400 font-bold">Oui</span>
                          ) : (
                            <span className="text-slate-600">Optionnel</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {prop.enum ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                              [{prop.enum.join(', ')}]
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PostgreSQL View */}
      {activeSubTab === 'sql' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Définition DDL PostgreSQL / Supabase</h3>
              <p className="text-xs text-slate-400">
                Prêt pour l'exécution dans une instance Cloud SQL PostgreSQL ou Supabase Studio.
              </p>
            </div>
            <button
              onClick={() => handleCopy(postgresDdl)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition font-medium"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier SQL'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-amber-300/90 font-mono text-xs overflow-x-auto max-h-[500px]">
            {postgresDdl}
          </pre>
        </div>
      )}

      {/* Security Rules View */}
      {activeSubTab === 'rules' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Règles de Sécurité Actives (firestore.rules)
              </h3>
              <p className="text-xs text-slate-400">
                Gouvernance multi-tenant Zero-Trust avec protection anti-escalade de privilèges.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Default Deny
              </span>
              <p className="text-slate-400 text-[11px]">
                Toutes les écritures non autorisées sur les sous-collections sont strictement bloquées par défaut.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Anti-Escalade Rôle
              </span>
              <p className="text-slate-400 text-[11px]">
                Interdiction formelle pour un utilisateur de modifier son propre champ <code>role</code> vers admin.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-blue-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Validation OTP Colis
              </span>
              <p className="text-slate-400 text-[11px]">
                Le passage du colis au statut <code>livre</code> est validé avec le code OTP ou la signature du client.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Auditor / Red Team Simulation */}
      {activeSubTab === 'auditor' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Matrice de Contrôle d'Accès & Audit Red Team
            </h3>
            <p className="text-xs text-slate-400">
              Vérification des piliers de sécurité selon les normes ABAC / RBAC.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                test: 'Attaque par Shadow Update (Ghost field injection)',
                result: 'BLOQUÉ (REJETÉ)',
                status: 'pass',
                details: 'La validation des clés strictes hasOnly rejette toute insertion de champs non documentés.'
              },
              {
                test: 'Usurpation de rôle Admin sur /users/{uid}',
                result: 'BLOQUÉ (REJETÉ)',
                status: 'pass',
                details: 'Règle stricte : request.resource.data.role != "admin" sauf si déjà admin vérifié.'
              },
              {
                test: 'Modification de statut Colis sans être livreur assigné ou agence',
                result: 'BLOQUÉ (REJETÉ)',
                status: 'pass',
                details: 'Seul le livreur détenteur du token de tournée ou l\'agence propriétaire peut muter l\'état.'
              },
              {
                test: 'Protection par déni de portefeuille (Denial of Wallet)',
                result: 'PROTÉGÉ',
                status: 'pass',
                details: 'Les chaînes de caractères et identifiants sont strictement plafonnés en taille (<= 128 chars).'
              }
            ].map((audit, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-white">{audit.test}</p>
                  <p className="text-slate-400 text-[11px]">{audit.details}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                  {audit.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
