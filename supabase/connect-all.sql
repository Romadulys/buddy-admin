-- =========================================================
-- BUDDY — Migration complète : connexion web ↔ admin
-- Compatible Postgres 14+  (pas de CREATE POLICY IF NOT EXISTS)
-- =========================================================

-- ── 1. FAQ items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faq_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text        NOT NULL,
  answer      text        NOT NULL,
  category    text        NOT NULL DEFAULT 'Produit',
  published   boolean     NOT NULL DEFAULT true,
  display_order integer   NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_faq_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_faq_updated_at ON faq_items;
CREATE TRIGGER trg_faq_updated_at
  BEFORE UPDATE ON faq_items
  FOR EACH ROW EXECUTE FUNCTION update_faq_updated_at();

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='faq_items' AND policyname='Public read published FAQs'
  ) THEN
    CREATE POLICY "Public read published FAQs"
      ON faq_items FOR SELECT USING (published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='faq_items' AND policyname='Service role full access'
  ) THEN
    CREATE POLICY "Service role full access"
      ON faq_items FOR ALL USING (true);
  END IF;
END $$;

-- ── 2. Orders (commandes web) ─────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz DEFAULT now(),
  status           text        NOT NULL DEFAULT 'pending',
  customer_email   text,
  customer_name    text,
  items            jsonb       NOT NULL DEFAULT '[]',
  total_amount     numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb,
  notes            text,
  source           text        DEFAULT 'web',
  coque_slug       text,
  type             text        DEFAULT 'coque'
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Anyone can insert orders'
  ) THEN
    CREATE POLICY "Anyone can insert orders"
      ON orders FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Service role read all orders'
  ) THEN
    CREATE POLICY "Service role read all orders"
      ON orders FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Service role update orders'
  ) THEN
    CREATE POLICY "Service role update orders"
      ON orders FOR UPDATE USING (true);
  END IF;
END $$;

-- ── 3. Reviews (avis clients) ─────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  author_name text        NOT NULL,
  author_role text,
  content     text        NOT NULL,
  rating      integer     NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  coque_name  text,
  published   boolean     NOT NULL DEFAULT true,
  featured    boolean     NOT NULL DEFAULT false,
  display_order integer   NOT NULL DEFAULT 0
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Public read published reviews'
  ) THEN
    CREATE POLICY "Public read published reviews"
      ON reviews FOR SELECT USING (published = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Service role full access reviews'
  ) THEN
    CREATE POLICY "Service role full access reviews"
      ON reviews FOR ALL USING (true);
  END IF;
END $$;

-- ── 4. Coques catalog ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS coques (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text        UNIQUE NOT NULL,
  name          text        NOT NULL,
  label         text        NOT NULL,
  emoji         text        NOT NULL DEFAULT '🎨',
  img           text        NOT NULL,
  hex_color     text        NOT NULL DEFAULT '#9333EA',
  description   text        NOT NULL DEFAULT '',
  tags          text[]      NOT NULL DEFAULT '{}',
  price         numeric(10,2) NOT NULL DEFAULT 14.99,
  active        boolean     NOT NULL DEFAULT true,
  popular       boolean     NOT NULL DEFAULT false,
  is_new        boolean     NOT NULL DEFAULT false,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE coques ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='coques' AND policyname='Public read active coques'
  ) THEN
    CREATE POLICY "Public read active coques"
      ON coques FOR SELECT USING (active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='coques' AND policyname='Service role full access coques'
  ) THEN
    CREATE POLICY "Service role full access coques"
      ON coques FOR ALL USING (true);
  END IF;
END $$;

-- ── 5. Seed: FAQ items (25 Q&A) ───────────────────────────
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

-- ── 6. Seed: Reviews ──────────────────────────────────────
INSERT INTO reviews (author_name, author_role, content, rating, coque_name, published, featured, display_order) VALUES
  ('Sophie M.', 'Maman de Lucas, 6 ans', 'Mon fils adore son Buddy Pingouin. Il l''utilise tous les jours pour me dire qu''il est arrivé à l''école. Plus de stress pour moi !', 5, 'Pablo le Pingouin', true, true, 1),
  ('Thomas D.', 'Papa de Léa, 7 ans', 'J''hésitais entre un smartphone et une montre GPS. Buddy est la solution parfaite : ma fille communique sans les dangers d''Internet.', 5, 'Luna la Licorne', true, true, 2),
  ('Camille R.', 'Maman de Chloé, 5 ans', 'La coque Sirène a été choisie par ma fille en 2 secondes. Elle la chérit comme un jouet. Et moi j''ai la paix d''esprit.', 5, 'Ariel la Sirène', true, true, 3),
  ('Marie L.', 'Maman de Théo, 6 ans', 'Installation en 5 minutes chrono. Théo a compris le bouton PTT tout seul. La LED qui s''illumine le fascine !', 5, 'Drago le Dragon', true, false, 4),
  ('Pierre B.', 'Papa de Juliette, 7 ans', 'Le GPS est précis, les notifications parents instantanées. On a testé à 2km de distance, ça marche parfaitement.', 5, 'Fantôme Kawaii', true, false, 5),
  ('Isabelle C.', 'Maman de Paul, 5 ans', 'Enfin un outil fait pour les enfants ET pour les parents anxieux ! La qualité audio est excellente.', 5, 'Bambou le Panda', true, false, 6)
ON CONFLICT DO NOTHING;

-- ── 7. Seed: Coques catalog ───────────────────────────────
INSERT INTO coques (slug, name, label, emoji, img, hex_color, description, tags, price, active, popular, is_new, display_order) VALUES
  ('luna', 'Luna', 'Licorne Rose', '🦄', '/images/device/p02.jpg', '#EC4899', 'Luna est la coque licorne arc-en-ciel, parfaite pour les petites fées en herbe. La coque préférée des enfants qui croient à la magie.', ARRAY['fille','licorne','rose'], 14.99, true, true, false, 1),
  ('ariel', 'Ariel', 'Sirène Princesse', '🧜', '/images/device/p12.jpg', '#14B8A6', 'Ariel plonge votre enfant dans les fonds marins avec sa couronne de nacre et sa queue scintillante.', ARRAY['fille','sirène','mer','princesse'], 14.99, true, true, false, 2),
  ('drago', 'Drago', 'Dragon Vert', '🐉', '/images/device/p13.jpg', '#22C55E', 'Drago est un petit dragon kawaii avec ses ailes et sa queue touffue. La coque parfaite pour les amateurs de créatures fantastiques.', ARRAY['garçon','fille','dragon','vert'], 14.99, true, true, false, 3),
  ('fantome', 'Fantôme', 'Fantôme Kawaii', '👻', '/images/device/p17.jpg', '#9333EA', 'Ce petit fantôme translucide est la coque la plus originale de la collection. Pour les enfants qui n''ont peur de rien.', ARRAY['garçon','fille','fantôme','violet'], 14.99, true, false, true, 4),
  ('bambou', 'Bambou', 'Panda', '🐼', '/images/device/p05.jpg', '#18181B', 'Bambou est un panda tout en rondeurs, simple, doux et irrésistible.', ARRAY['garçon','fille','panda','noir','blanc'], 14.99, true, true, false, 5),
  ('pablo', 'Pablo', 'Pingouin', '🐧', '/images/device/p03.jpg', '#64748B', 'Pablo le pingouin avec son ventre blanc et son bec orange. Un classique de la collection.', ARRAY['garçon','fille','pingouin'], 14.99, true, true, false, 6),
  ('aviateur', 'Aviateur', 'Avion Bleu', '✈️', '/images/device/p21.jpg', '#3B82F6', 'Un adorable avion bleu avec ses ailes déployées et son hélice rouge. Pour les futurs pilotes.', ARRAY['garçon','avion','bleu','véhicule'], 14.99, true, false, true, 7),
  ('lola', 'Lola', 'Lapin Blanc', '🐰', '/images/device/p09.jpg', '#F43F5E', 'Lola est un lapin tout blanc aux longues oreilles roses. Douce et câline.', ARRAY['fille','lapin','blanc','rose'], 14.99, true, true, false, 8),
  ('mimi', 'Mimi', 'Chat Gris', '🐱', '/images/device/p07.jpg', '#9CA3AF', 'Mimi est un chat gris avec ses moustaches et ses petites oreilles triangulaires.', ARRAY['fille','chat','gris'], 14.99, true, false, false, 9),
  ('ellie', 'Ellie', 'Éléphant', '🐘', '/images/device/p15.jpg', '#94A3B8', 'Ellie avec ses grandes oreilles rondes et sa trompe 3D. Ses yeux en étoile font craqués.', ARRAY['fille','éléphant','gris'], 14.99, true, false, true, 10),
  ('pompier', 'Pompier', 'Camion de Pompier', '🚒', '/images/device/p16.jpg', '#EF4444', 'Un camion de pompier avec des échelles sur les côtés et un visage kawaii. Pour les futurs héros !', ARRAY['garçon','pompier','rouge','véhicule'], 14.99, true, true, false, 11),
  ('flash', 'Flash', 'Voiture de Course', '🏎️', '/images/device/p14.jpg', '#DC2626', 'Flash est une voiture de course rouge avec aileron et bandes blanches. Pour les amateurs de vitesse.', ARRAY['garçon','voiture','rouge','course'], 14.99, true, true, false, 12),
  ('herisson', 'Hérisson', 'Hérisson', '🦔', '/images/device/p22.jpg', '#F59E0B', 'Ce hérisson avec son ventre clair et ses piquants en relief est totalement irrésistible.', ARRAY['garçon','fille','hérisson','marron'], 14.99, true, false, true, 13),
  ('rex', 'Rex', 'Dinosaure T-Rex', '🦕', '/images/device/p25.jpg', '#16A34A', 'Rex est un T-Rex vert vif avec ses crocs et ses yeux pétillants. Parfait pour les fans de dinos.', ARRAY['garçon','dinosaure','vert'], 14.99, true, true, false, 14),
  ('roux', 'Roux', 'Renard', '🦊', '/images/device/p20.jpg', '#F97316', 'Roux est un renard orange avec ses oreilles pointues et son museau blanc. Malicieux mais adorable.', ARRAY['garçon','fille','renard','orange'], 14.99, true, false, false, 15),
  ('pip', 'Pip', 'Caneton Jaune', '🐣', '/images/device/p06.jpg', '#EAB308', 'Pip est un caneton jaune tout rond avec sa touffe de plumes espiègle. La coque la plus solaire.', ARRAY['garçon','fille','canard','jaune'], 14.99, true, false, false, 16),
  ('leo', 'Léo', 'Lionceau', '🦁', '/images/device/p01.jpg', '#D97706', 'Léo est un lionceau marron avec sa crinière hérissée. Courageux et affectueux.', ARRAY['garçon','lion','marron'], 14.99, true, false, false, 17),
  ('nino', 'Nino', 'Petit Ours', '🐻', '/images/device/p08.jpg', '#92400E', 'Nino est un petit ours brun avec ses oreilles rondes. Doux et câlin, un classique intemporel.', ARRAY['garçon','fille','ours','marron'], 14.99, true, false, false, 18),
  ('orso', 'Orso', 'Ours Noir', '🐻‍❄️', '/images/device/p04.jpg', '#3F3F46', 'Orso est un ours noir et blanc avec une touche de modernité. Pour les looks graphiques.', ARRAY['garçon','fille','ours','noir'], 14.99, true, false, true, 19),
  ('caramel', 'Caramel', 'Ours Pêche', '🍑', '/images/device/p10.jpg', '#FB923C', 'Caramel est un ours pêche aux couleurs chaudes et apaisantes. Le compagnon des câlins.', ARRAY['fille','ours','pêche'], 14.99, true, false, false, 20),
  ('coton', 'Coton', 'Grand Lapin', '🐰', '/images/device/p11.jpg', '#FDA4AF', 'Coton est un grand lapin blanc aux longues oreilles. Encore plus moelleux que Lola.', ARRAY['fille','lapin','blanc','rose'], 14.99, true, false, false, 21),
  ('fantasia', 'Fantasia', 'Surprise', '✨', '/images/device/p19.jpg', '#A855F7', 'Fantasia est la coque mystère. Un personnage unique qui se dévoile à la réception !', ARRAY['garçon','fille','mystère'], 14.99, true, false, true, 22)
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  active = EXCLUDED.active,
  popular = EXCLUDED.popular,
  is_new = EXCLUDED.is_new,
  display_order = EXCLUDED.display_order;
