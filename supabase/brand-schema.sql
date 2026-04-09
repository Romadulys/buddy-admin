-- ============================================================
-- Brand Guidelines & Assets Schema
-- Marketing Engine Phase 1 — Buddy Admin
-- ============================================================

-- brand_guidelines: one row per brand section
CREATE TABLE IF NOT EXISTS brand_guidelines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section     text UNIQUE NOT NULL CHECK (section IN (
                'identity', 'colors', 'typography', 'tone',
                'vocabulary', 'logos', 'rules'
              )),
  content     jsonb NOT NULL DEFAULT '{}',
  version     int  NOT NULL DEFAULT 1,
  updated_by  uuid,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- brand_assets: brand file library
CREATE TABLE IF NOT EXISTS brand_assets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category     text NOT NULL CHECK (category IN (
                 'logo', 'photo', 'illustration', 'template', 'font', 'icon'
               )),
  name         text NOT NULL,
  file_url     text NOT NULL,
  file_type    text NOT NULL,
  file_size    int,
  dimensions   jsonb,
  tags         text[] NOT NULL DEFAULT '{}',
  usage_notes  text,
  uploaded_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brand_assets_category ON brand_assets(category);

-- ============================================================
-- Seed: 7 brand_guidelines rows for Buddy
-- ============================================================

INSERT INTO brand_guidelines (section, content) VALUES

-- 1. Identity
('identity', '{
  "name": "Buddy",
  "tagline": "Tes mots prennent leur envol",
  "mission": "Communication sans ecran pour les enfants de 4 a 8 ans",
  "target": "Parents d'\''enfants de 4 a 8 ans",
  "positioning": "Buddy est le premier appareil de communication pour enfants qui remplace le smartphone par une experience physique, ludique et bienveillante. Nous permettons aux familles de rester connectees sans exposer les enfants aux dangers des ecrans.",
  "values": ["Bienveillance", "Simplicite", "Securite", "Connexion familiale", "Autonomie progressive"]
}')

ON CONFLICT (section) DO NOTHING,

-- 2. Colors
('colors', '{
  "primary": [
    {"name": "Buddy Purple", "hex": "#9333EA", "usage": "Couleur principale — CTAs, titres, elements interactifs cles"},
    {"name": "Buddy Pink",   "hex": "#EC4899", "usage": "Accent secondaire — illustrations enfants, highlights"},
    {"name": "Buddy Orange", "hex": "#F97316", "usage": "Energie, gamification, badges et notifications"},
    {"name": "Buddy Blue",   "hex": "#3B82F6", "usage": "Confiance, fonctionnalites parents, elements de securite"}
  ],
  "neutral": [
    {"name": "Slate 900", "hex": "#0f172a", "usage": "Texte principal, fond sombre"},
    {"name": "Slate 50",  "hex": "#f8fafc", "usage": "Fond clair, sections aeres"}
  ],
  "gradients": [
    {"name": "Buddy Gradient",  "value": "linear-gradient(135deg, #9333EA, #EC4899)", "usage": "Hero sections, bannieres principales"},
    {"name": "Sunset Gradient", "value": "linear-gradient(135deg, #F97316, #EC4899)", "usage": "Sections energie et fun"}
  ]
}')

ON CONFLICT (section) DO NOTHING,

-- 3. Typography
('typography', '{
  "heading": {
    "family": "Poppins",
    "weight": "Bold (700)",
    "usage": "Titres H1-H3, accroches, CTAs",
    "fallback": "system-ui, sans-serif"
  },
  "body": {
    "family": "Inter",
    "weight": "Regular (400)",
    "usage": "Corps de texte, descriptions, paragraphes",
    "fallback": "system-ui, sans-serif"
  },
  "accent": {
    "family": "Poppins",
    "weight": "Semi-Bold (600)",
    "usage": "Sous-titres, labels, badges, boutons secondaires",
    "fallback": "system-ui, sans-serif"
  },
  "scale": {
    "h1": "3rem / 48px",
    "h2": "2rem / 32px",
    "h3": "1.5rem / 24px",
    "body": "1rem / 16px",
    "small": "0.875rem / 14px"
  }
}')

ON CONFLICT (section) DO NOTHING,

-- 4. Tone
('tone', '{
  "personality": "Buddy parle comme un ami bienveillant de la famille — jamais condescendant, jamais anxiogene. Notre voix est celle d'\''un parent moderne qui comprend les enjeux du numerique et propose des solutions concretes et positives.",
  "do": ["Chaleureux", "Rassurant", "Simple", "Ludique", "Positif"],
  "dont": ["Technique", "Anxiogene", "Condescendant", "Agressif"],
  "examples": [
    {"type": "do",   "text": "Restez connectes avec vos enfants, sans les ecrans"},
    {"type": "dont", "text": "Protegez vos enfants des dangers d'\''internet"}
  ]
}')

ON CONFLICT (section) DO NOTHING,

-- 5. Vocabulary
('vocabulary', '{
  "prefer": [
    {"use": "appareil de communication", "instead_of": "montre connectee",     "reason": "Positionne le produit sur la communication, pas la technologie"},
    {"use": "connexion familiale",       "instead_of": "surveillance parentale", "reason": "Emphase sur le lien, pas le controle"},
    {"use": "zone de securite",          "instead_of": "geofencing",            "reason": "Accessible aux parents non techniques"},
    {"use": "message vocal",             "instead_of": "audio message",         "reason": "Francais naturel, compris de tous"},
    {"use": "alerte SOS",                "instead_of": "bouton panique",        "reason": "Rassurant, moins dramatique"},
    {"use": "autonomie",                 "instead_of": "independance",          "reason": "Connotation positive, progressive"}
  ],
  "always_mention": ["sans ecran", "GPS", "SOS"],
  "never_use": ["surveillance", "tracker", "espionner", "controle total", "espionnage"]
}')

ON CONFLICT (section) DO NOTHING,

-- 6. Logos
('logos', '{
  "files": [
    {"variant": "primary",  "description": "Logo Buddy couleur sur fond clair",  "format": "SVG + PNG",  "usage": "Site web, presentations, supports print"},
    {"variant": "white",    "description": "Logo Buddy blanc sur fond colore",   "format": "SVG + PNG",  "usage": "Header sombre, gradient backgrounds"},
    {"variant": "compact",  "description": "Icone seule (B) sans logotype",      "format": "SVG + PNG",  "usage": "Favicon, app icon, petits espaces"}
  ],
  "rules": {
    "minimum_size": "24px hauteur",
    "clear_space": "Espace libre = hauteur du logo x 0.5 tout autour",
    "forbidden": [
      "Ne pas deformer ou etirer le logo",
      "Ne pas changer les couleurs du logo principal",
      "Ne pas ajouter d'\''effets (ombre, contour, rotation)",
      "Ne pas placer sur un fond qui nuit a la lisibilite"
    ]
  }
}')

ON CONFLICT (section) DO NOTHING,

-- 7. Rules
('rules', '{
  "general": [
    "Toujours utiliser les couleurs de la charte graphique definie",
    "Conserver une hierarchie visuelle claire : titre > sous-titre > corps",
    "Privilegier les visuels avec des enfants heureux en contexte naturel",
    "Ne jamais utiliser de stock photos generiques sans approbation",
    "Assurer un contraste minimum AA pour l'\''accessibilite (WCAG 2.1)"
  ],
  "content": [
    "Chaque visuel doit etre teste aupres d'\''au moins un parent de la cible",
    "Le message principal doit etre comprehensible en moins de 5 secondes",
    "Toujours inclure un CTA clair et unique par communication",
    "Les visuels produit doivent montrer Buddy en contexte d'\''usage reel",
    "Les communications B2B (ecoles, mutuelles) adoptent un ton plus formel mais gardent la bienveillance",
    "Relire systematiquement pour supprimer tout jargon technique non explique"
  ]
}')

ON CONFLICT (section) DO NOTHING;
