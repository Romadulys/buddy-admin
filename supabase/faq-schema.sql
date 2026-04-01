-- Table FAQ items
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Général',
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS faq_items_order_idx ON faq_items(category, display_order);

-- RLS
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Public read (for website)
CREATE POLICY "Public can read published faq" ON faq_items
  FOR SELECT USING (published = true);

-- Admin full access (service role bypasses RLS)

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_faq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER faq_updated_at
  BEFORE UPDATE ON faq_items
  FOR EACH ROW EXECUTE FUNCTION update_faq_updated_at();

-- Seed data (25 FAQ)
INSERT INTO faq_items (question, answer, category, display_order) VALUES
-- Produit
('Quel âge pour utiliser Buddy ?', 'Buddy est conçu pour les enfants de 4 à 8 ans. L''interface 100% vocale (pas de texte à lire, pas d''écran) le rend intuitif dès 4 ans. Des parents l''utilisent aussi avec des enfants jusqu''à 10-12 ans.', 'Produit', 1),
('Quelle est la différence avec un smartphone ?', 'Buddy n''a pas d''écran, pas d''accès internet, pas de jeux, pas de réseaux sociaux. C''est uniquement un outil de communication sécurisé : messages vocaux + GPS + SOS. Zéro distraction, 100% connexion familiale.', 'Produit', 2),
('Buddy est-il résistant ? Mon enfant est brutal.', 'Oui ! Buddy est certifié IP67 (étanche jusqu''à 1m pendant 30 min) et résiste aux chutes jusqu''à 1,5m. Le boîtier est en ABS renforcé avec surmoulage silicone. Il est conçu pour la vie d''un enfant.', 'Produit', 3),
('Quelles sont les dimensions de Buddy ?', 'Buddy mesure 80×60×20mm et pèse 150g. C''est le format d''un walkie-talkie — facile à tenir dans une petite main, à glisser dans un sac ou à accrocher à une cordelette.', 'Produit', 4),
('Combien de personnalités sont disponibles ?', '6 personnalités au lancement : Léo le Lion 🦁, Bella le Lapin 🐰, Luna la Licorne 🦄, Rex le Dino 🦖, Finn le Requin 🦈, et Pao le Panda 🐼. Chaque Buddy a sa couleur signature.', 'Produit', 5),
-- Fonctionnement
('Comment envoyer un message vocal ?', 'C''est simple : l''enfant appuie sur le grand bouton PTT (Push-To-Talk), parle, puis relâche. La barre LED se remplit pendant qu''il parle, puis une animation lumineuse "envoie" le message. Le destinataire le reçoit instantanément.', 'Fonctionnement', 1),
('Comment fonctionne le GPS ?', 'Buddy intègre un module GPS qui transmet la position toutes les 30 secondes (configurable). Les parents voient la position en temps réel sur la carte dans l''app. L''historique des positions est conservé 7 jours.', 'Fonctionnement', 2),
('Comment déclencher une alerte SOS ?', 'L''enfant fait une double pression rapide sur le bouton PTT, puis maintient 3 secondes (total ~4s). C''est assez long pour éviter les déclenchements accidentels, mais simple à mémoriser. Une vibration courte confirme l''envoi.', 'Fonctionnement', 3),
('Combien de contacts peut-on enregistrer ?', 'Maximum 5 contacts par Buddy. L''enfant navigue entre les contacts avec un bouton dédié et entend l''annonce vocale ("Maman", "Papa", "Mamie"...) avant d''appuyer sur PTT.', 'Fonctionnement', 4),
('Quelle est l''autonomie de la batterie ?', 'L''objectif est 1 semaine d''utilisation normale (2-4 messages/jour, GPS actif). La recharge se fait via USB-C. Une LED indique le niveau batterie, et les parents reçoivent une notification à 20%.', 'Fonctionnement', 5),
-- Application
('L''application est disponible sur quels appareils ?', 'L''application Buddy est disponible sur iOS (iPhone) et Android. Elle est gratuite à télécharger — l''abonnement Buddy est nécessaire pour activer la connectivité.', 'Application', 1),
('Combien de parents peuvent accéder à l''app ?', 'Autant que vous voulez ! Un compte famille peut être partagé avec les deux parents, les grands-parents, la nounou... Chaque adulte de confiance peut voir la position et écouter les messages.', 'Application', 2),
('Peut-on gérer plusieurs Buddy dans une app ?', 'Oui, jusqu''à 5 Buddy par compte famille. Idéal si vous avez plusieurs enfants.', 'Application', 3),
('Comment configurer les zones géographiques ?', 'Dans l''app, tu dessines des zones sur la carte (cercle ou polygone). Tu peux en créer autant que tu veux : école, maison, chez les grands-parents... Tu choisis si tu veux une alerte à l''entrée, à la sortie, ou les deux.', 'Application', 4),
('Peut-on répondre à l''enfant depuis l''app ?', 'Oui ! Les parents peuvent envoyer un message vocal à l''enfant directement depuis l''app. Le Buddy de l''enfant joue le message automatiquement via le haut-parleur.', 'Application', 5),
-- Abonnement
('Combien coûte Buddy ?', 'Le device coûte 119€ (achat unique, port offert en France). L''abonnement connectivité est de 4,99€/mois (ou 6,99€/mois avec roaming Europe). Sans abonnement, le GPS et les messages ne fonctionnent pas.', 'Abonnement', 1),
('L''abonnement est-il sans engagement ?', 'Oui, l''abonnement est sans engagement. Tu peux l''annuler à tout moment depuis l''app ou depuis ton compte en ligne. La résiliation prend effet à la fin de la période en cours.', 'Abonnement', 2),
('Y a-t-il une période d''essai gratuite ?', 'Oui ! 30 jours d''essai gratuit à l''activation. Si tu n''es pas satisfait, tu es remboursé intégralement — device inclus.', 'Abonnement', 3),
('Le roaming international est-il inclus ?', 'Le plan standard (4,99€/mois) fonctionne en France métropolitaine. Pour le roaming Europe, c''est 6,99€/mois. Une option roaming international est en développement.', 'Abonnement', 4),
-- Sécurité
('Qui peut envoyer des messages à mon enfant ?', 'Uniquement les contacts que les parents ont configurés dans l''app (max 5). Buddy est un système fermé — il est impossible de recevoir un message d''un inconnu.', 'Sécurité', 1),
('Les messages sont-ils chiffrés ?', 'Oui. Tous les messages transitent via notre cloud sécurisé avec chiffrement TLS. Les messages vocaux sont stockés 30 jours puis supprimés automatiquement. Les clips SOS sont conservés 90 jours.', 'Sécurité', 2),
('Mon enfant peut-il accéder à internet avec Buddy ?', 'Non, il est techniquement impossible. Buddy n''a pas de navigateur, pas d''app store, pas d''accès aux réseaux. La connexion 4G est utilisée uniquement pour les messages et le GPS.', 'Sécurité', 3),
-- Livraison
('Quand sera livré Buddy ?', 'Les premiers Buddy sont attendus pour l''été 2026. Les précommandes seront honorées par ordre d''arrivée.', 'Livraison', 1),
('Livrez-vous en dehors de France ?', 'Au lancement, nous livrons en France métropolitaine. La livraison en Belgique, Suisse et Luxembourg est prévue pour fin 2026.', 'Livraison', 2),
('Puis-je annuler ma précommande ?', 'Oui, tu peux annuler ta précommande à tout moment avant l''expédition et être remboursé intégralement sous 5 jours ouvrés.', 'Livraison', 3);
