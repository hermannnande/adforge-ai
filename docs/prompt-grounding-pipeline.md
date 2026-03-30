# Prompt Grounding Pipeline

## Architecture

Le pipeline de prompt grounding garantit que le prompt utilisateur reste l'instruction principale à chaque étape de la génération d'image.

```
User Input → Raw Prompt Preservation → Multi-Image Collection
           → Project Context Memory → Drift Detection
           → Canonical Request → Minimal Enrichment
           → Provider Translation → Provider API
```

## Composants

### 1. Raw Prompt Preservation (`raw-prompt.service.ts`)
- **Rôle** : Conserver le prompt brut de l'utilisateur
- **Règle** : Ne JAMAIS réécrire ou résumer destructivement
- Supprime uniquement les marqueurs synthétiques du frontend (`[Retouche...]`, `[X images...]`)
- Détecte si c'est un delta (modification) ou une nouvelle demande

### 2. Multi-Image Pipeline (`multi-image-pipeline.service.ts`)
- **Rôle** : Collecter et classifier TOUTES les images importées
- **Règle** : Aucune image ne doit être silencieusement ignorée
- Assigne un rôle à chaque image (PRIMARY_PRODUCT, STYLE_REFERENCE, etc.)
- Produit un log d'utilisation pour audit

### 3. Project Context Memory (`project-context-memory.service.ts`)
- **Rôle** : Maintenir la mémoire du projet entre les requêtes
- Détecte le thème (beauté, santé, mode, etc.) et le type de sortie (poster, bannière, etc.)
- Persiste les décisions approuvées

### 4. Drift Guard (`drift-guard.service.ts`)
- **Rôle** : Empêcher la dérive du contexte projet
- Distingue delta (modification mineure) vs changement de direction
- Préserve le contexte projet sauf changement explicite

### 5. Canonical Request Builder (`canonical-request.service.ts`)
- **Rôle** : Construire la requête canonique structurée
- Structure : `primaryInstruction` (prompt brut) + context + assets + constraints
- Le `primaryInstruction` reste TOUJOURS la phrase principale

### 6. Minimal Enrichment (`minimal-enrichment.service.ts`)
- **Rôle** : Ajouter le minimum de contexte utile
- **Interdit** : Réécrire le concept, imposer un style non demandé, inventer des éléments
- **Autorisé** : Instructions de préservation d'image, qualité, format

### 7. Provider Translator (`provider-translator.service.ts`)
- **Rôle** : Adapter le prompt à chaque provider sans changer l'intention
- Chaque provider reçoit le même sens mais dans un format adapté
- TOUTES les images sont transmises

### 8. Audit Logger (`audit-logger.service.ts`)
- **Rôle** : Traçabilité complète de chaque génération
- Log : rawUserPrompt, assetsReceived/Analyzed/Used, driftDetected, finalPromptLength

## Règle fondamentale

```
finalProviderInput =
  1. primary instruction = prompt brut utilisateur (DOMINANT)
  2. project memory = contexte projet court
  3. reference assets = résumé structuré de toutes les images importées
  4. locked constraints = produit / branding / objectif / format
  5. provider formatting = adaptation légère au provider
```

Le point 1 doit rester dominant. Les points 2-5 ne doivent PAS écraser le point 1.

## Tests

```bash
npx vitest run tests/prompt-grounding/
```

4 suites, 18 tests couvrant :
- Préservation du prompt brut
- Détection de delta vs nouvelle direction
- Enrichissement minimal
- Construction de la requête canonique
