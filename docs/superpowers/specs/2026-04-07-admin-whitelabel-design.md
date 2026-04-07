# Admin Whitelabel — Design Spec

**Date:** 2026-04-07
**Status:** Draft
**Approach:** Fork + brand.config.ts (Approach A)

## Context

buddy-admin est un dashboard Next.js 16 complet (clients, devices, abos, support, B2B pipeline/commandes/stock/livraisons/simulateur, contenu). On veut en faire une **base marque blanche** réutilisable pour n'importe quelle entreprise.

**Workflow cible :** Claude Code reçoit le nom d'une marque → scrape le site → génère un `brand.config.ts` → fork le repo → l'admin est prêt.

**Premier test :** Globber (trottinettes enfants/ados/adultes).

## Architecture

### Nouveau repo : `admin-whitelabel`

Fork de buddy-admin, nettoyé et généralisé. Chaque instance client = un fork de ce repo avec son propre `brand.config.ts`.

```
admin-whitelabel/
├── brand.config.ts          ← SEUL fichier à modifier par client
├── app/                     ← Pages (lisent la config)
├── components/              ← Composants (lisent la config)
├── lib/
│   ├── brand.ts             ← Helper getBrand() + types
│   ├── supabase.ts          ← Inchangé (env vars)
│   ├── mock-data.ts         ← Mock data générée depuis config
│   └── ...
└── ...
```

### brand.config.ts — Le fichier central

```typescript
import { BrandConfig } from '@/lib/brand'

const config: BrandConfig = {
  // Identité
  name: 'Globber',
  fullName: 'Globber France',
  tagline: 'Gestion & Distribution',
  logo: '/logo.png',            // ou emoji/lettre fallback
  logoFallback: 'G',
  domain: 'globber.fr',
  adminEmail: 'admin@globber.fr',

  // Couleurs (Tailwind tokens)
  colors: {
    primary: 'teal',            // Tailwind color name
    primaryHex: '#2d9fc2',      // Pour CSS custom
    secondary: 'slate',
    accent: 'orange',
    sidebar: '#002b44',
  },

  // Produits (remplace Buddy Mini / Buddy Big)
  products: [
    { id: 'trot-enfant', name: 'Trottinette Enfant', shortName: 'Trott. Enfant', price: 89.99 },
    { id: 'trot-ado', name: 'Trottinette Ado', shortName: 'Trott. Ado', price: 129.99 },
    { id: 'trot-adulte', name: 'Trottinette Adulte', shortName: 'Trott. Adulte', price: 179.99 },
  ],
  accessories: [
    { id: 'casque', name: 'Casque de protection', price: 29.99 },
    { id: 'led-kit', name: 'Kit LED sécurité', price: 14.99 },
  ],
  productIdPrefix: 'GLB',

  // Modules actifs
  modules: {
    dashboard: true,
    clients: true,
    products: true,           // remplace "devices"
    subscriptions: false,     // Globber n'a pas d'abos
    referral: false,
    support: true,            // sans SOS
    webOrders: true,
    contentFaq: true,
    contentReviews: true,
    contentCustom: false,     // "coques" retiré
    b2bPipeline: true,
    b2bClients: true,
    b2bOrders: true,
    b2bDeliveries: true,
    b2bStock: true,
    b2bSimulator: true,
  },

  // B2B
  b2b: {
    kitPresets: [
      { name: 'Kit Retail Standard', products: { 'trot-enfant': 10, 'trot-ado': 5 } },
      { name: 'Kit Lancement', products: { 'trot-enfant': 20, 'trot-ado': 10, 'trot-adulte': 5 } },
    ],
    quoteEmailSubject: 'Devis Globber — Commande B2B',
    teamSignature: "L'équipe Globber",
  },

  // Support
  support: {
    enableSOS: false,
    enableChat: true,
    enableTickets: true,
  },

  // Locale
  locale: 'fr-FR',
  currency: 'EUR',
}

export default config
```

### lib/brand.ts — Types et helper

```typescript
export interface Product {
  id: string
  name: string
  shortName: string
  price: number
}

export interface BrandConfig {
  name: string
  fullName: string
  tagline: string
  logo: string
  logoFallback: string
  domain: string
  adminEmail: string

  colors: {
    primary: string
    primaryHex: string
    secondary: string
    accent: string
    sidebar: string
  }

  products: Product[]
  accessories: Product[]
  productIdPrefix: string

  modules: Record<string, boolean>

  b2b: {
    kitPresets: Array<{ name: string; products: Record<string, number> }>
    quoteEmailSubject: string
    teamSignature: string
  }

  support: {
    enableSOS: boolean
    enableChat: boolean
    enableTickets: boolean
  }

  locale: string
  currency: string
}

// Singleton
import config from '@/brand.config'
export function getBrand(): BrandConfig { return config }
```

## Changements par fichier

### Composants

| Fichier | Changement |
|---------|-----------|
| `components/Sidebar.tsx` | Lire `getBrand()` pour nom, logo, couleur sidebar, filtrer les liens par `modules.*` |
| `app/layout.tsx` | Titre et meta depuis `getBrand().name` |
| `app/login/page.tsx` | Email/password depuis env vars, branding depuis config |
| `app/dashboard/page.tsx` | KPI labels dynamiques, couleurs depuis config |
| `app/devices/page.tsx` → `app/products/page.tsx` | Renommer route, utiliser `getBrand().products` |
| `app/support/page.tsx` | Masquer tab SOS si `support.enableSOS === false` |
| `app/subscriptions/page.tsx` | Page entière masquée si `modules.subscriptions === false` |
| `app/content/coques/` | Supprimé (trop spécifique Buddy) |

### Mock data

| Fichier | Changement |
|---------|-----------|
| `lib/b2b-mock.ts` | Générer depuis `getBrand().products` au lieu de hardcoder "Buddy Mini/Big" |
| `lib/stock-mock.ts` | Idem, stock basé sur `getBrand().products` |
| `lib/email-mock.ts` | Templates avec `getBrand().name` et `getBrand().b2b.teamSignature` |

### Routes conditionnelles

La Sidebar filtre déjà les liens affichés via `modules.*`. Pour les routes elles-mêmes, le middleware redirige vers `/dashboard` si un module désactivé est accédé :

```typescript
// middleware.ts
import { getBrand } from '@/lib/brand'

const moduleRoutes: Record<string, string> = {
  '/devices': 'products',      // ancienne route redirigée
  '/products': 'products',
  '/subscriptions': 'subscriptions',
  '/referral': 'referral',
  // ...
}
```

## Modules retirés de la base (vs buddy-admin)

| Module | Raison |
|--------|--------|
| SOS | Spécifique GPS tracker — tab masquée par config |
| Devices (en tant que "appareils GPS") | Remplacé par "Produits" générique |
| Coques | Trop spécifique Buddy — supprimé |

## Ce qui reste identique

- Architecture Next.js 16 App Router
- Supabase (auth + DB) via env vars
- Tailwind CSS pour le styling
- Recharts pour les graphiques
- Structure B2B complète (pipeline, commandes, stock, livraisons, simulateur)
- Support (tickets + chat)
- Content management (FAQ, avis)

## Workflow de déploiement d'un nouveau client

```
1. Fork admin-whitelabel → nouveau repo "globber-admin"
2. Claude Code scrape le site du client
3. Claude Code génère brand.config.ts
4. Claude Code place le logo dans public/
5. Créer un projet Supabase dédié
6. Configurer les env vars (.env.local)
7. Deploy sur Vercel
```

## Hors scope (Phase 2+)

- Inscription automatique / onboarding self-service
- Multi-tenant (un seul déploiement pour N clients)
- Système de plugins modulaire
- CRM/Chat enrichi (en dev dans buddy-admin, sera porté après)
- Billing / facturation SaaS
- API de génération de config automatique
