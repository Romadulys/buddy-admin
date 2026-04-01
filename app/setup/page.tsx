'use client'

import { useState, useEffect } from 'react'

const SQL = `-- =========================================================
-- BUDDY — Migration complète : connexion web ↔ admin
-- Compatible Postgres 14+  (pas de CREATE POLICY IF NOT EXISTS)
-- =========================================================

-- 1. FAQ items
CREATE TABLE IF NOT EXISTS faq_items (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  question      text        NOT NULL,
  answer        text        NOT NULL,
  category      text        NOT NULL DEFAULT 'Produit',
  published     boolean     NOT NULL DEFAULT true,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE OR REPLACE FUNCTION update_faq_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_faq_updated_at ON faq_items;
CREATE TRIGGER trg_faq_updated_at BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION update_faq_updated_at();
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faq_items' AND policyname='Public read published FAQs') THEN
    CREATE POLICY "Public read published FAQs" ON faq_items FOR SELECT USING (published = true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faq_items' AND policyname='Service role full access') THEN
    CREATE POLICY "Service role full access" ON faq_items FOR ALL USING (true);
  END IF;
END $$;

-- 2. Orders
CREATE TABLE IF NOT EXISTS orders (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz   DEFAULT now(),
  status           text          NOT NULL DEFAULT 'pending',
  customer_email   text,
  customer_name    text,
  items            jsonb         NOT NULL DEFAULT '[]',
  total_amount     numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb,
  notes            text,
  source           text          DEFAULT 'web',
  coque_slug       text,
  type             text          DEFAULT 'coque'
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Anyone can insert orders') THEN
    CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Service role read all orders') THEN
    CREATE POLICY "Service role read all orders" ON orders FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Service role update orders') THEN
    CREATE POLICY "Service role update orders" ON orders FOR UPDATE USING (true);
  END IF;
END $$;

-- 3. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id            uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz DEFAULT now(),
  author_name   text      NOT NULL,
  author_role   text,
  content       text      NOT NULL,
  rating        integer   NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  coque_name    text,
  published     boolean   NOT NULL DEFAULT true,
  featured      boolean   NOT NULL DEFAULT false,
  display_order integer   NOT NULL DEFAULT 0
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Public read published reviews') THEN
    CREATE POLICY "Public read published reviews" ON reviews FOR SELECT USING (published = true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Service role full access reviews') THEN
    CREATE POLICY "Service role full access reviews" ON reviews FOR ALL USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Public can submit reviews') THEN
    CREATE POLICY "Public can submit reviews" ON reviews FOR INSERT WITH CHECK (published = false);
  END IF;
END $$;

-- 4. Coques
CREATE TABLE IF NOT EXISTS coques (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text          UNIQUE NOT NULL,
  name          text          NOT NULL,
  label         text          NOT NULL,
  emoji         text          NOT NULL DEFAULT '🎨',
  img           text          NOT NULL,
  hex_color     text          NOT NULL DEFAULT '#9333EA',
  description   text          NOT NULL DEFAULT '',
  tags          text[]        NOT NULL DEFAULT '{}',
  price         numeric(10,2) NOT NULL DEFAULT 14.99,
  active        boolean       NOT NULL DEFAULT true,
  popular       boolean       NOT NULL DEFAULT false,
  is_new        boolean       NOT NULL DEFAULT false,
  display_order integer       NOT NULL DEFAULT 0,
  created_at    timestamptz   DEFAULT now(),
  updated_at    timestamptz   DEFAULT now()
);
ALTER TABLE coques ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coques' AND policyname='Public read active coques') THEN
    CREATE POLICY "Public read active coques" ON coques FOR SELECT USING (active = true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coques' AND policyname='Service role full access coques') THEN
    CREATE POLICY "Service role full access coques" ON coques FOR ALL USING (true);
  END IF;
END $$;

-- 5. Seed FAQ (25 questions)
INSERT INTO faq_items (question, answer, category, published, display_order) VALUES
  ('Qu''est-ce que Buddy exactement ?', 'Buddy est un communicateur vocal sans écran conçu pour les enfants de 4 à 8 ans. Il permet d''envoyer des messages vocaux, de partager sa position GPS et de déclencher une alerte SOS. Pas d''écran, pas de distraction.', 'Produit', true, 1),
  ('Quel est le prix de Buddy ?', 'Buddy est disponible en précommande à 119€ (port offert). Un abonnement de 4,99€/mois est requis pour le GPS, les messages et la 4G. Code BUDDY10 pour -10% sur l''abonnement annuel.', 'Produit', true, 2),
  ('À partir de quel âge ?', 'Buddy est conçu pour les 4-8 ans. L''interface 100% vocale le rend intuitif dès 4 ans. Pas de texte à lire, un seul bouton PTT.', 'Produit', true, 3),
  ('Buddy est-il résistant ?', 'Oui ! Buddy est certifié IP67 (étanche 1m / 30min) et résiste aux chutes jusqu''à 1,5m. Boîtier ABS renforcé + surmoulage silicone. Conçu pour la vie d''un enfant.', 'Produit', true, 4),
  ('Combien de personnages sont disponibles ?', 'Plus de 20 coques au lancement : licorne, sirène, dragon, pingouin, panda, renard, éléphant, camion de pompier, voiture de course… Chacune se change en 3 secondes.', 'Produit', true, 5),
  ('Comment envoyer un message vocal ?', 'L''enfant appuie sur le bouton PTT, parle, relâche. La barre LED se remplit pendant qu''il parle. Le message est envoyé instantanément au contact sélectionné.', 'Fonctionnement', true, 1),
  ('Comment fonctionne le GPS ?', 'Buddy transmet la position toutes les 30 secondes (configurable). Les parents voient la position en temps réel sur la carte dans l''app. Historique 7 jours.', 'Fonctionnement', true, 2),
  ('Comment déclencher une alerte SOS ?', 'Double pression rapide sur PTT puis maintien 3 secondes. Assez long pour éviter les accidents, simple à mémoriser. Vibration courte confirme l''envoi.', 'Fonctionnement', true, 3),
  ('Combien de contacts peut-on enregistrer ?', '5 contacts maximum par Buddy. L''enfant navigue entre eux avec un bouton dédié et entend l''annonce vocale (Maman, Papa, Mamie…) avant d''appuyer sur PTT.', 'Fonctionnement', true, 4),
  ('Quelle est l''autonomie ?', '7 jours d''utilisation normale (2-4 messages/jour, GPS actif). Recharge USB-C. Notification parents à 20%.', 'Fonctionnement', true, 5),
  ('L''application est disponible sur quels appareils ?', 'iOS et Android. Gratuite à télécharger. L''abonnement Buddy est nécessaire pour activer la connectivité.', 'Application', true, 1),
  ('Combien de parents peuvent accéder à l''app ?', 'Autant que vous voulez. Un compte famille peut être partagé avec les deux parents, les grands-parents, la nounou…', 'Application', true, 2),
  ('Peut-on gérer plusieurs Buddy ?', 'Oui, jusqu''à 5 Buddy par compte famille. Idéal pour plusieurs enfants.', 'Application', true, 3),
  ('Comment configurer les zones géographiques ?', 'Dans l''app, dessinez des zones sur la carte (cercle ou polygone). Autant que vous voulez : école, maison, chez les grands-parents… Alerte à l''entrée, à la sortie, ou les deux.', 'Application', true, 4),
  ('Peut-on répondre à l''enfant depuis l''app ?', 'Oui ! Les parents envoient un message vocal directement depuis l''app. Le Buddy de l''enfant joue le message automatiquement.', 'Application', true, 5),
  ('L''abonnement est-il sans engagement ?', 'Oui, sans engagement. Annulation à tout moment depuis l''app ou le compte en ligne. Résiliation à fin de période.', 'Abonnement', true, 1),
  ('Y a-t-il une période d''essai gratuite ?', '30 jours d''essai gratuit à l''activation. Si pas satisfait, remboursement intégral — device inclus.', 'Abonnement', true, 2),
  ('Le roaming international est-il inclus ?', 'Le plan standard (4,99€/mois) fonctionne en France métropolitaine. Roaming Europe à 6,99€/mois. Option internationale en développement.', 'Abonnement', false, 3),
  ('Qui peut envoyer des messages à mon enfant ?', 'Uniquement les contacts configurés par les parents dans l''app (max 5). Système fermé — impossible de recevoir un message d''un inconnu.', 'Sécurité', true, 1),
  ('Les messages sont-ils chiffrés ?', 'Oui. Transit via cloud sécurisé avec chiffrement TLS. Messages stockés 30 jours puis supprimés. Clips SOS conservés 90 jours.', 'Sécurité', true, 2),
  ('Mon enfant peut-il accéder à Internet ?', 'Non, techniquement impossible. Buddy n''a pas de navigateur ni d''app store. La 4G sert uniquement aux messages et au GPS.', 'Sécurité', true, 3),
  ('Quand sera livré Buddy ?', 'Les premiers Buddy sont attendus pour l''été 2026. Les précommandes sont honorées par ordre d''arrivée.', 'Livraison', true, 1),
  ('Livrez-vous en dehors de France ?', 'Au lancement, France métropolitaine uniquement. Belgique, Suisse et Luxembourg prévus fin 2026.', 'Livraison', true, 2),
  ('Puis-je annuler ma précommande ?', 'Oui, annulation possible avant expédition avec remboursement intégral sous 5 jours ouvrés.', 'Livraison', true, 3),
  ('Les coques sont-elles interchangeables ?', 'Oui ! Toutes les coques Buddy sont compatibles entre elles. Clip-on magnétique — changement en 3 secondes. La recharge fonctionne sans retirer la coque.', 'Produit', true, 6)
ON CONFLICT DO NOTHING;

-- 6. Seed Reviews
INSERT INTO reviews (author_name, author_role, content, rating, coque_name, published, featured, display_order) VALUES
  ('Sophie M.', 'Maman de Lucas, 6 ans', 'Mon fils adore son Buddy Pingouin. Il l''utilise tous les jours pour me dire qu''il est arrivé à l''école. Plus de stress pour moi !', 5, 'Pablo le Pingouin', true, true, 1),
  ('Thomas D.', 'Papa de Léa, 7 ans', 'J''hésitais entre un smartphone et une montre GPS. Buddy est la solution parfaite : ma fille communique sans les dangers d''Internet.', 5, 'Luna la Licorne', true, true, 2),
  ('Camille R.', 'Maman de Chloé, 5 ans', 'La coque Sirène a été choisie par ma fille en 2 secondes. Elle la chérit comme un jouet. Et moi j''ai la paix d''esprit.', 5, 'Ariel la Sirène', true, true, 3),
  ('Marie L.', 'Maman de Théo, 6 ans', 'Installation en 5 minutes chrono. Théo a compris le bouton PTT tout seul. La LED qui s''illumine le fascine !', 5, 'Drago le Dragon', true, false, 4),
  ('Pierre B.', 'Papa de Juliette, 7 ans', 'Le GPS est précis, les notifications parents instantanées. On a testé à 2km de distance, ça marche parfaitement.', 5, 'Fantôme Kawaii', true, false, 5),
  ('Isabelle C.', 'Maman de Paul, 5 ans', 'Enfin un outil fait pour les enfants ET pour les parents anxieux ! La qualité audio est excellente.', 5, 'Bambou le Panda', true, false, 6)
ON CONFLICT DO NOTHING;

-- =========================================================
-- Chat tables (messagerie live widget)
-- =========================================================

-- 7. Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  visitor_name  text,
  visitor_email text,
  status        text        NOT NULL DEFAULT 'open',
  buddy_skin    text        NOT NULL DEFAULT 'luna',
  last_message_at timestamptz DEFAULT now()
);

-- 8. Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  content     text        NOT NULL,
  sender      text        NOT NULL,
  read        boolean     NOT NULL DEFAULT false
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_sessions' AND policyname='Public can create sessions') THEN
    CREATE POLICY "Public can create sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_sessions' AND policyname='Public can read own session') THEN
    CREATE POLICY "Public can read own session" ON chat_sessions FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_sessions' AND policyname='Public can update own session') THEN
    CREATE POLICY "Public can update own session" ON chat_sessions FOR UPDATE USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_messages' AND policyname='Public can insert messages') THEN
    CREATE POLICY "Public can insert messages" ON chat_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='chat_messages' AND policyname='Public can read messages') THEN
    CREATE POLICY "Public can read messages" ON chat_messages FOR SELECT USING (true);
  END IF;
END $$;`

const SUPABASE_URL = 'https://supabase.com/dashboard/project/zkqnydmlvueaosxykwmc/sql/new'

const CHECKS = [
  { key: 'faq_items', label: 'Table FAQ', icon: '❓' },
  { key: 'orders', label: 'Table Commandes', icon: '🛒' },
  { key: 'reviews', label: 'Table Avis', icon: '⭐' },
  { key: 'coques', label: 'Table Coques', icon: '🎨' },
]

export default function SetupPage() {
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<Record<string, 'checking' | 'ok' | 'missing'>>({})
  const [migrating, setMigrating] = useState(false)
  const [migrateResult, setMigrateResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const checkTables = async () => {
    setStatus({})
    for (const { key } of CHECKS) {
      try {
        const res = await fetch(`/api/setup/check?table=${key}`)
        const data = await res.json()
        setStatus((s) => ({ ...s, [key]: data.exists ? 'ok' : 'missing' }))
      } catch {
        setStatus((s) => ({ ...s, [key]: 'missing' }))
      }
    }
  }

  // Check table existence via API
  useEffect(() => {
    checkTables()
  }, [])

  const handleRunMigration = async () => {
    setMigrating(true)
    setMigrateResult(null)
    try {
      const res = await fetch('/api/setup/run-migration', {
        method: 'POST',
        headers: { 'x-migration-secret': 'buddy-migrate-2026' },
      })
      const data = await res.json()
      if (data.success) {
        setMigrateResult({ ok: true, msg: 'Migration réussie ! Vérification des tables…' })
        setTimeout(checkTables, 1000)
      } else {
        setMigrateResult({ ok: false, msg: data.error || 'Erreur inconnue' })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setMigrateResult({ ok: false, msg })
    } finally {
      setMigrating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const allOk = CHECKS.every((c) => status[c.key] === 'ok')
  const anyChecking = CHECKS.some((c) => !status[c.key] || status[c.key] === 'checking')

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Setup Supabase</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Connexion admin ↔ site web via Supabase
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {CHECKS.map(({ key, label, icon }) => {
          const s = status[key]
          return (
            <div
              key={key}
              className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${
                s === 'ok'
                  ? 'border-green-200'
                  : s === 'missing'
                  ? 'border-red-200'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                {s === 'checking' || !s ? (
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-indigo-500 animate-spin" />
                ) : s === 'ok' ? (
                  <span className="text-green-500 text-lg">✓</span>
                ) : (
                  <span className="text-red-400 text-lg">✕</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className={`text-xs mt-0.5 font-medium ${
                s === 'ok' ? 'text-green-600' : s === 'missing' ? 'text-red-500' : 'text-gray-400'
              }`}>
                {s === 'ok' ? 'Opérationnelle' : s === 'missing' ? 'À créer' : 'Vérification…'}
              </p>
            </div>
          )
        })}
      </div>

      {migrateResult && (
        <div className={`rounded-2xl border p-4 flex items-center gap-3 ${migrateResult.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <span className="text-2xl">{migrateResult.ok ? '✅' : '❌'}</span>
          <p className={`text-sm font-medium ${migrateResult.ok ? 'text-green-800' : 'text-red-800'}`}>{migrateResult.msg}</p>
        </div>
      )}

      {allOk ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
          <span className="text-4xl">🎉</span>
          <div>
            <p className="font-bold text-green-800 text-lg">Tout est connecté !</p>
            <p className="text-green-700 text-sm mt-0.5">
              Les 4 tables Supabase sont opérationnelles. FAQ, Commandes, Avis et Coques sont synchronisés entre l&apos;admin et le site web.
            </p>
          </div>
        </div>
      ) : !anyChecking ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <p className="font-bold text-amber-800 text-lg">Tables manquantes</p>
              <p className="text-amber-700 text-sm mt-1">
                Clique <strong>Migration automatique</strong> pour créer les tables en 1 clic.
                Ou colle le SQL manuellement dans l&apos;éditeur Supabase.
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition-colors"
            >
              {copied ? '✓ Copié !' : '📋 Copier le SQL'}
            </button>
            <a
              href={SUPABASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition-colors"
            >
              <span>🗄️</span>
              Ouvrir Supabase SQL Editor
            </a>
          </div>
        </div>
      ) : null}

      {/* SQL Block */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-mono text-gray-500">connect-all.sql</span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {copied ? '✓ Copié !' : '📋 Copier'}
          </button>
        </div>
        <pre className="p-5 text-xs text-gray-600 overflow-x-auto leading-relaxed max-h-96 overflow-y-auto font-mono">
          {SQL}
        </pre>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-gray-900">Comment faire ?</h2>
        {[
          { n: '1', text: 'Clique "Copier le SQL" (bouton violet)', icon: '📋' },
          { n: '2', text: 'Clique "Ouvrir Supabase SQL Editor" (bouton vert)', icon: '🗄️' },
          { n: '3', text: 'Colle le SQL dans l\'éditeur (Ctrl+V)', icon: '📝' },
          { n: '4', text: 'Clique le bouton vert "Run" en bas à droite', icon: '▶️' },
          { n: '5', text: 'Reviens ici — les 4 indicateurs passeront au vert ✓', icon: '✅' },
        ].map((step) => (
          <div key={step.n} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center flex-shrink-0">
              {step.n}
            </div>
            <span className="text-xl">{step.icon}</span>
            <p className="text-sm text-gray-700">{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
