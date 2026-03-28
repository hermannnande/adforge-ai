# AdForge AI

**Plateforme SaaS de génération d'affiches publicitaires assistée par IA.**

Créez des visuels marketing réalistes, convaincants et prêts à vendre en quelques minutes grâce à un agent IA conversationnel qui vous guide de l'idée au rendu final.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Zustand, TanStack Query |
| Backend | Next.js Route Handlers, Server Actions, Prisma ORM, PostgreSQL (Neon) |
| Auth | Clerk |
| IA | OpenAI (GPT-Image-1, GPT-4o-mini), Google Gemini (Flash, Pro) |
| Paiements | Stripe + CinetPay (Mobile Money) |
| Stockage | Cloudflare R2 |
| Cache/Queue | Upstash Redis |
| Déploiement | Vercel |

## Démarrage rapide

```bash
# Cloner le repo
git clone <repo-url>
cd adforge-ai

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local
# Remplir les valeurs dans .env.local

# Lancer en développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Linting ESLint |
| `npm run format` | Formatage Prettier |
| `npm run typecheck` | Vérification TypeScript |
| `npm run test` | Tests Vitest |
| `npm run check` | Typecheck + Lint + Format check |

## Structure du projet

```
src/
├── app/           # Routes Next.js (App Router)
│   ├── (public)/  # Pages publiques (landing, pricing, FAQ)
│   ├── (auth)/    # Pages auth (login, register, onboarding)
│   ├── (dashboard)/ # Pages app protégées
│   ├── admin/     # Pages admin
│   └── api/       # Route handlers API
├── components/    # Composants React
├── features/      # Logique métier côté client
├── lib/           # Utilitaires, constantes, validateurs
├── server/        # Services, repositories, providers
├── stores/        # Zustand stores
├── hooks/         # Hooks React personnalisés
├── types/         # Types TypeScript
├── styles/        # Design tokens
└── i18n/          # Traductions FR/EN
```

## Phases de développement

- [x] Phase 0 — Cadrage
- [x] Phase 1 — Bootstrap
- [ ] Phase 2 — Base de données + Auth
- [ ] Phase 3 — Landing page premium
- [ ] Phase 4 — Dashboard + Bibliothèque
- [ ] Phase 5 — Studio conversationnel
- [ ] Phase 6 — Couche IA
- [ ] Phase 7 — Crédits
- [ ] Phase 8 — Paiements
- [ ] Phase 9 — Brand Kit + Templates + Exports
- [ ] Phase 10 — Admin + Observabilité
- [ ] Phase 11 — Hardening

## Licence

Propriétaire. Tous droits réservés.
