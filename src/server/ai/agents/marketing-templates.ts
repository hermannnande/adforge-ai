/**
 * Bibliothèque de templates marketing photo-réalistes par secteur.
 *
 * Chaque template encode des patterns visuels éprouvés en photographie
 * publicitaire commerciale, utilisables comme base pour composer un prompt
 * de qualité même quand le brief utilisateur est incomplet.
 *
 * Structure:
 *  - sector: secteur principal (beauté, mode, restauration, ...)
 *  - useCase: type d'affiche (produit, lifestyle, promo, lancement, ...)
 *  - matchPatterns: regex pour matcher automatiquement le brief
 *  - composition: angle de prise de vue + cadrage
 *  - lighting: type d'éclairage photo
 *  - setting: décor/contexte
 *  - propsHints: éléments à inclure
 *  - colorPalettes: 1 à 3 palettes possibles (FR)
 *  - moodKeywords: mots d'ambiance
 *  - headlinePatterns: patterns d'accroche FR (utilisent {product}, {offer}, {category})
 *  - ctaPool: pool de CTAs adaptés
 *  - photoStyle: style photographique (editorial, packshot, lifestyle, ...)
 */

export interface MarketingTemplate {
  id: string;
  sector: string;
  useCase: string;
  matchPatterns: RegExp[];
  composition: string;
  lighting: string;
  setting: string;
  propsHints: string[];
  colorPalettes: string[][];
  moodKeywords: string[];
  headlinePatterns: string[];
  ctaPool: string[];
  photoStyle: string;
  toneAdvice: string;
}

const T = {
  // ─── BEAUTÉ / COSMÉTIQUE ─────────────────────────────────────────────────
  beautyLuxuryProduct: {
    id: 'beauty-luxury-product',
    sector: 'beauté',
    useCase: 'product',
    matchPatterns: [
      /cr[èe]me|s[ée]rum|soin|cosm[ée]ti|maquillage|parfum|beaut[ée]|skin\s*care|skincare|lotion|huile|baume|gel|masque|hydrat|anti.?(rides?|[âa]ge)/i,
    ],
    composition:
      'centered hero packshot, slight 3/4 angle, product floating on a polished marble surface with subtle shadow',
    lighting:
      'soft directional studio lighting with golden rim light, gentle reflections on the glass/packaging, glowing highlights',
    setting:
      'minimal luxury surface (marble, brushed gold, silk) with soft bokeh in background, flower petals or water droplets accents',
    propsHints: [
      'eau dorée en suspension, gouttes',
      'pétales de fleur',
      'plumes douces',
      'satin ou soie en arrière-plan',
      'lumière dorée diffuse',
    ],
    colorPalettes: [
      ['rose poudré', 'doré champagne', 'blanc nacré'],
      ['noir mat', 'or rose', 'crème'],
      ['vert sauge', 'doré clair', 'ivoire'],
    ],
    moodKeywords: ['luxueux', 'sensoriel', 'haut de gamme', 'apaisant', 'sophistiqué'],
    headlinePatterns: [
      'Révélez votre éclat',
      'L\'éclat retrouvé',
      'Beauté intemporelle',
      '{product} — la nouvelle référence',
      'L\'art du soin',
      'Votre rituel d\'exception',
    ],
    ctaPool: ['Découvrir', 'Acheter maintenant', 'En profiter', 'Commander', 'Tester gratuitement'],
    photoStyle:
      'editorial luxury cosmetic photography, ultra-detailed product texture, hyperrealistic, magazine-quality, depth of field f/2.8',
    toneAdvice: 'Premium, sensoriel, raffiné — texte minimaliste, espaces respirants',
  },

  beautyAntiAging: {
    id: 'beauty-antiaging',
    sector: 'beauté',
    useCase: 'product',
    matchPatterns: [/anti.?(rides?|[âa]ge|wrinkle|aging)|jeunesse|raffermissant|liftant|lift/i],
    composition:
      'product centered, beam of golden light hitting the bottle, soft glow effect around the product',
    lighting: 'golden hour studio lighting, sun-kissed halo, soft glow, warm tones',
    setting: 'creamy beige backdrop with soft satin folds, golden droplets floating',
    propsHints: ['gouttes dorées', 'feuilles d\'or fines', 'satin crème', 'reflets miroir doux'],
    colorPalettes: [
      ['or champagne', 'beige nacré', 'blanc lumière'],
      ['ivoire', 'doré antique', 'rose pêche'],
    ],
    moodKeywords: ['rajeunissant', 'lumineux', 'précieux', 'vivifiant'],
    headlinePatterns: [
      'Le secret de la jeunesse',
      'Effet visible dès 7 jours',
      'L\'âge, transcendé',
      'Lift instantané',
    ],
    ctaPool: ['Rajeunir maintenant', 'Voir le résultat', 'Commander', 'Découvrir l\'effet'],
    photoStyle:
      'high-end skincare advertising photography, glowing highlights, ultra-sharp product details, dewy texture',
    toneAdvice: 'Premium, scientifique mais sensoriel, lumineux',
  },

  // ─── MODE / SNEAKERS ─────────────────────────────────────────────────────
  fashionSneakers: {
    id: 'fashion-sneakers',
    sector: 'mode',
    useCase: 'product',
    matchPatterns: [/sneaker|basket|chaussure|nike|adidas|jordan|puma|new\s*balance|reebok|trainers?|running\s*shoes?/i],
    composition:
      'sneaker on a colored geometric pedestal, side angle, dynamic 15° tilt, subtle floating effect with shadow',
    lighting:
      'studio strobe with hard rim light from above-left, deep contrast, glossy highlights on materials',
    setting:
      'bold flat color backdrop (electric blue, hot red, neon green) or concrete urban surface, geometric color blocks',
    propsHints: ['cube géométrique', 'fond color block contrasté', 'ombre nette', 'fumée légère'],
    colorPalettes: [
      ['rouge néon', 'noir', 'blanc'],
      ['bleu électrique', 'jaune fluo', 'noir'],
      ['vert lime', 'magenta', 'blanc cassé'],
    ],
    moodKeywords: ['urbain', 'audacieux', 'streetwear', 'dynamique', 'contemporain'],
    headlinePatterns: [
      'Step Up',
      'Marche dans ton style',
      'Limited drop',
      'New Drop — {product}',
      'Le style sans compromis',
    ],
    ctaPool: ['Acheter maintenant', 'Shop la drop', 'Stock limité', 'En profiter'],
    photoStyle:
      'streetwear advertising photography, sharp product details, vibrant colors, Nike-style ad aesthetic, hyperrealistic textures',
    toneAdvice: 'Audacieux, urbain, jeune — texte court et percutant',
  },

  fashionApparel: {
    id: 'fashion-apparel',
    sector: 'mode',
    useCase: 'lifestyle',
    matchPatterns: [/v[eê]tement|mode|fashion|robe|costume|chemise|pantalon|t.?shirt|veste|manteau|jeans?|outfit/i],
    composition:
      'fashion editorial portrait, model 3/4 view, confident pose, garment as the visual focus',
    lighting: 'soft natural window light, slight rim, magazine editorial mood',
    setting: 'clean architectural interior or neutral studio with subtle texture wall',
    propsHints: ['mur texturé', 'lumière naturelle', 'mobilier minimaliste'],
    colorPalettes: [
      ['camel', 'crème', 'noir'],
      ['terracotta', 'beige', 'blanc cassé'],
      ['vert forêt', 'crème', 'or vieilli'],
    ],
    moodKeywords: ['éditorial', 'élégant', 'minimaliste', 'intemporel', 'chic'],
    headlinePatterns: [
      'Nouvelle collection',
      'Le style, sans effort',
      'Été {year}',
      '{product} — réinventé',
    ],
    ctaPool: ['Découvrir la collection', 'Shop', 'En profiter', 'Voir tout'],
    photoStyle:
      'fashion editorial photography, Vogue-style lighting, natural model expression, full color grading',
    toneAdvice: 'Chic, intemporel, raffiné — laisser respirer le visuel',
  },

  // ─── RESTAURATION / FOOD ─────────────────────────────────────────────────
  foodFastFood: {
    id: 'food-fastfood',
    sector: 'restauration',
    useCase: 'product',
    matchPatterns: [/burger|pizza|sandwich|hot.?dog|kebab|tacos?|wrap|fast.?food|frites|nuggets?/i],
    composition:
      'mouth-watering 45° angle hero shot, food filling 70% of frame, steam rising, ingredients visible',
    lighting:
      'warm golden side lighting, accentuating juicy textures, melting cheese highlights, steam glow',
    setting:
      'rustic dark wood surface or signature brand color background, scattered ingredients (sesame seeds, herbs, sauce drips)',
    propsHints: [
      'fumée chaude qui monte',
      'fromage qui coule',
      'gouttes de sauce',
      'graines de sésame éparses',
      'feuilles de laitue fraîche',
    ],
    colorPalettes: [
      ['jaune doré', 'rouge ketchup', 'brun caramel'],
      ['orange feu', 'jaune mais', 'noir mat'],
    ],
    moodKeywords: ['gourmand', 'appétissant', 'généreux', 'savoureux', 'irrésistible'],
    headlinePatterns: [
      'L\'envie irrésistible',
      'Le goût qui fait revenir',
      'Nouveau : {product}',
      'Plus gourmand que jamais',
      'Goûte à la légende',
    ],
    ctaPool: ['Commander', 'Goûter maintenant', 'Trouver un point', 'Livraison rapide'],
    photoStyle:
      'commercial food photography, McDonald\'s/Burger King ad style, hyperrealistic textures, glistening highlights, dripping sauces, mouth-watering',
    toneAdvice: 'Gourmand, accessible, énergique — couleurs chaudes',
  },

  foodGourmet: {
    id: 'food-gourmet',
    sector: 'restauration',
    useCase: 'lifestyle',
    matchPatterns: [/restaurant|gastronomie|gourmet|chef|cuisine|plat|menu|assiette|d[eé]gustation/i],
    composition:
      'overhead flat lay or 30° angle on a beautifully plated dish, negative space for text top-left',
    lighting:
      'soft window light from the left, gentle shadows, natural restaurant ambiance',
    setting:
      'dark slate plate or aged wood, linen napkin, subtle herbs garnish, glass of wine in background',
    propsHints: ['herbes fraîches', 'serviette en lin', 'verre de vin flou', 'couverts en argent'],
    colorPalettes: [
      ['vert sauge', 'doré chaud', 'noir ardoise'],
      ['rouge bordeaux', 'crème', 'doré antique'],
    ],
    moodKeywords: ['raffiné', 'chaleureux', 'authentique', 'gourmet', 'artisanal'],
    headlinePatterns: [
      'L\'expérience gastronomique',
      'Réservez votre table',
      'Cuisine d\'auteur',
      '{product} — la signature du chef',
    ],
    ctaPool: ['Réserver', 'Découvrir le menu', 'Voir la carte', 'Réserver une table'],
    photoStyle:
      'editorial food photography, Michelin restaurant aesthetic, natural texture, food magazine quality',
    toneAdvice: 'Raffiné, sensoriel, authentique — laisser parler le visuel',
  },

  foodBeverage: {
    id: 'food-beverage',
    sector: 'alimentation',
    useCase: 'product',
    matchPatterns: [/boisson|drink|jus|cocktail|caf[ée]|coffee|th[ée]|tea|smoothie|soda|eau|wine|vin|bi[èe]re|beer/i],
    composition:
      'beverage centered, slight low angle to show liquid, condensation on glass, splashing droplets frozen',
    lighting:
      'backlit setup highlighting liquid translucency, side rim light for depth, water droplets glistening',
    setting:
      'clean color backdrop matching the brand palette, ice cubes or fresh fruit slices around',
    propsHints: ['glaçons', 'tranche de citron', 'paille', 'gouttes de condensation', 'éclaboussures figées'],
    colorPalettes: [
      ['ambré', 'or', 'caramel'],
      ['vert frais', 'jaune citron', 'blanc'],
      ['rouge cerise', 'rose', 'crème'],
    ],
    moodKeywords: ['rafraîchissant', 'vibrant', 'pur', 'énergisant'],
    headlinePatterns: [
      'La fraîcheur pure',
      'Réveillez vos sens',
      '{product} — pur plaisir',
      'Le goût authentique',
    ],
    ctaPool: ['Goûter', 'Acheter maintenant', 'Découvrir', 'Commander'],
    photoStyle:
      'beverage advertising photography, Coca-Cola style splash, hyperrealistic ice and bubbles, condensation detail',
    toneAdvice: 'Vibrant, rafraîchissant, énergique',
  },

  // ─── IMMOBILIER ──────────────────────────────────────────────────────────
  realEstate: {
    id: 'real-estate',
    sector: 'immobilier',
    useCase: 'product',
    matchPatterns: [/immobilier|maison|villa|appartement|house|apartment|propri[ée]t[ée]|terrain|location|achat\s*maison/i],
    composition:
      'wide architectural exterior shot, golden hour, warm interior lights showing through windows',
    lighting: 'golden hour outdoor or warm dusk lighting, balanced exposure interior/exterior',
    setting: 'manicured landscape with subtle pool reflection or stylized urban backdrop',
    propsHints: ['piscine', 'lumières chaudes intérieures', 'jardin paysagé', 'voiture de luxe en silhouette'],
    colorPalettes: [
      ['ocre doré', 'bleu nuit', 'crème'],
      ['gris pierre', 'or chaud', 'vert sapin'],
    ],
    moodKeywords: ['premium', 'aspirational', 'serein', 'haut de gamme', 'sécurisant'],
    headlinePatterns: [
      'Votre nouveau chez-vous',
      '{product} — l\'art de vivre',
      'Investissez dans l\'exception',
      'Visites privées',
    ],
    ctaPool: ['Visiter', 'Programmer une visite', 'Découvrir le bien', 'Demander des infos'],
    photoStyle:
      'real estate luxury photography, architectural digest aesthetic, twilight HDR, ultra-sharp details',
    toneAdvice: 'Aspirationnel, premium, rassurant',
  },

  // ─── AUTOMOBILE ──────────────────────────────────────────────────────────
  automotive: {
    id: 'automotive',
    sector: 'automobile',
    useCase: 'product',
    matchPatterns: [/voiture|auto|car|v[ée]hicule|suv|berline|moto|toyota|bmw|mercedes|peugeot|renault|tesla|audi/i],
    composition:
      '3/4 front low angle hero shot of the vehicle, slightly tilted, dynamic stance',
    lighting:
      'cinematic dual-source lighting, accent rim from behind, glossy paint reflections, dramatic contrast',
    setting:
      'wet asphalt with reflections, foggy mountain road, or sleek showroom with linear ceiling lights',
    propsHints: ['asphalte mouillé', 'reflets de la carrosserie', 'fumée légère', 'lumières linéaires'],
    colorPalettes: [
      ['noir mat', 'argent', 'rouge feu'],
      ['bleu nuit', 'chrome', 'blanc neige'],
    ],
    moodKeywords: ['puissant', 'élégant', 'cinématographique', 'haute performance'],
    headlinePatterns: [
      'Performance redéfinie',
      'L\'élégance sportive',
      '{product} — au-delà de la route',
      'L\'expérience pure',
    ],
    ctaPool: ['Configurer', 'Essai gratuit', 'Découvrir le modèle', 'Réserver un essai'],
    photoStyle:
      'automotive commercial photography, cinematic mood, hyper-detailed car body, dramatic lighting like BMW/Mercedes ads',
    toneAdvice: 'Cinématographique, puissant, premium',
  },

  // ─── SPORT / FITNESS ─────────────────────────────────────────────────────
  sportFitness: {
    id: 'sport-fitness',
    sector: 'sport',
    useCase: 'lifestyle',
    matchPatterns: [/sport|fitness|gym|muscul|crossfit|yoga|coaching|workout|training|prot[ée]ine|whey|bcaa|cardio/i],
    composition: 'dynamic action shot mid-movement, athlete in focus, motion blur on extremities',
    lighting: 'high-contrast spotlight, hard shadows, sweat highlights, theatrical mood',
    setting: 'industrial gym, dark background, light beams cutting through dust',
    propsHints: ['poussière dans la lumière', 'sueur visible', 'haltère', 'corde de combat', 'matériel pro'],
    colorPalettes: [
      ['noir profond', 'orange feu', 'gris acier'],
      ['rouge sang', 'noir', 'jaune électrique'],
    ],
    moodKeywords: ['énergique', 'intense', 'motivant', 'puissant', 'détermination'],
    headlinePatterns: [
      'Push your limits',
      'Dépasse-toi',
      'Le seul effort qui compte',
      '{product} — fuel your power',
    ],
    ctaPool: ['Commencer', 'Rejoindre', 'Acheter maintenant', 'Tester gratuitement'],
    photoStyle:
      'sports advertising photography, Nike/Under Armour style, high contrast cinematic, frozen motion, sweat detail',
    toneAdvice: 'Motivationnel, intense, énergique',
  },

  // ─── TECH / SAAS ─────────────────────────────────────────────────────────
  techSaas: {
    id: 'tech-saas',
    sector: 'technologie',
    useCase: 'product',
    matchPatterns: [/app(lication)?|saas|logiciel|software|plateforme|outil|crm|erp|ia|ai|tech|digital|dashboard|analytics|automation/i],
    composition:
      'product UI mockup floating on a clean surface, slight perspective tilt, soft shadow underneath, secondary device or detail nearby',
    lighting: 'soft even studio lighting, subtle gradient background, modern minimal',
    setting: 'gradient background (deep blue to purple, or warm orange to pink), abstract geometric shapes',
    propsHints: ['interface UI mockup', 'écran flottant', 'dégradé moderne', 'formes géométriques abstraites'],
    colorPalettes: [
      ['bleu nuit', 'violet', 'cyan'],
      ['orange chaud', 'rose', 'crème'],
      ['vert menthe', 'noir', 'blanc'],
    ],
    moodKeywords: ['moderne', 'innovant', 'efficace', 'futuriste', 'épuré'],
    headlinePatterns: [
      'L\'avenir, dès maintenant',
      '{product} — pensé pour vous',
      'Boostez votre productivité',
      'La nouvelle façon de travailler',
    ],
    ctaPool: ['Essayer gratuitement', 'Démarrer', 'Demander une démo', 'Commencer maintenant'],
    photoStyle:
      'modern SaaS landing hero, Apple-style minimalist, clean UI rendering, soft gradient',
    toneAdvice: 'Moderne, clair, futuriste — sobriété maximum',
  },

  // ─── SANTÉ / PHARMA ──────────────────────────────────────────────────────
  healthPharma: {
    id: 'health-pharma',
    sector: 'santé',
    useCase: 'product',
    matchPatterns: [
      /sant[ée]|pharma|m[ée]dicament|complement|vitamines?|verrues?|peau|derma|gel|pommade|cr[èe]me\s*(soin|m[ée]dical)|antifongique|cicatrisant/i,
    ],
    composition:
      'product centered with clean medical aesthetic, slight 3/4 angle, ingredients or symbols floating around',
    lighting: 'clean white studio lighting, soft shadow, hospital-clean cleanliness',
    setting: 'pure white or pastel green background, abstract medical molecule shapes',
    propsHints: ['feuilles médicinales', 'gouttes claires', 'cristaux transparents', 'symboles abstraits'],
    colorPalettes: [
      ['blanc pur', 'vert menthe', 'bleu clair'],
      ['blanc cassé', 'vert sauge', 'or léger'],
    ],
    moodKeywords: ['rassurant', 'efficace', 'pur', 'professionnel', 'scientifique'],
    headlinePatterns: [
      'Soulagement rapide',
      'Efficacité prouvée',
      '{product} — la solution',
      'Retrouvez votre confort',
    ],
    ctaPool: ['Acheter', 'Trouver en pharmacie', 'En savoir plus', 'Commander'],
    photoStyle:
      'pharmaceutical advertising photography, clean clinical aesthetic, ingredient highlights, trustworthy mood',
    toneAdvice: 'Rassurant, scientifique, clair',
  },

  // ─── E-COMMERCE GÉNÉRIQUE ───────────────────────────────────────────────
  ecommerceGeneric: {
    id: 'ecommerce-generic',
    sector: 'e-commerce',
    useCase: 'product',
    matchPatterns: [/produit|product|article|item|vente|sale|achat|shop|boutique|catalogue/i],
    composition:
      'clean centered packshot, soft shadow, slight 3/4 angle showing product depth',
    lighting: 'soft studio lighting, even illumination, professional product shot',
    setting: 'gradient or solid color backdrop matching product mood, minimal distractions',
    propsHints: ['fond dégradé', 'ombre douce', 'reflet subtil au sol'],
    colorPalettes: [
      ['blanc pur', 'gris clair', 'noir'],
      ['beige', 'crème', 'doré'],
    ],
    moodKeywords: ['professionnel', 'clair', 'commercial', 'attractif'],
    headlinePatterns: [
      'Nouveau : {product}',
      '{product} — disponible maintenant',
      '-{discount}% sur tout',
      'Promo flash {product}',
    ],
    ctaPool: ['Acheter', 'Commander', 'Voir le produit', 'Profiter de l\'offre'],
    photoStyle:
      'e-commerce product photography, Amazon-quality, sharp focus, minimal distractions',
    toneAdvice: 'Clair, commercial, direct',
  },

  // ─── PROMOTION GÉNÉRIQUE ─────────────────────────────────────────────────
  promoOffer: {
    id: 'promo-offer',
    sector: 'général',
    useCase: 'promo',
    matchPatterns: [/promo|promotion|solde|sale|r[ée]duction|discount|black\s*friday|noir|cyber\s*monday|offre|deal|prix\s*barr|-?\d+\s*%/i],
    composition:
      'product hero shot with bold price tag/discount badge prominently displayed, dynamic burst or sticker',
    lighting: 'bright energetic lighting, high contrast, attention-grabbing',
    setting: 'bold contrasting backdrop with confetti, sparks, or geometric burst behind product',
    propsHints: ['confettis', 'éclats lumineux', 'badge de prix', 'rayures dynamiques'],
    colorPalettes: [
      ['rouge vif', 'jaune', 'noir'],
      ['orange feu', 'jaune', 'blanc'],
    ],
    moodKeywords: ['urgent', 'irrésistible', 'énergique', 'flash', 'limité'],
    headlinePatterns: [
      'PROMO FLASH -{discount}%',
      'Stock limité — {product}',
      'Black Friday : {product}',
      '-50% aujourd\'hui seulement',
      'Offre exceptionnelle',
    ],
    ctaPool: ['J\'en profite', 'Commander vite', 'Acheter maintenant', 'Stock limité'],
    photoStyle:
      'sale advertising photography, high-impact, bold typography zones, retail commercial',
    toneAdvice: 'Urgent, énergique, à fort contraste',
  },

  // ─── LANCEMENT / NOUVEAU ─────────────────────────────────────────────────
  productLaunch: {
    id: 'product-launch',
    sector: 'général',
    useCase: 'launch',
    matchPatterns: [/lancement|nouveau|new|d[ée]bute|drop|sortie|launch|premiere|premi[èe]re/i],
    composition:
      'product reveal shot, dramatic lighting from above, smoke or particles around, hero pose',
    lighting: 'dramatic spotlight from above, dark surroundings, theatrical reveal mood',
    setting: 'dark moody backdrop with smoke/fog effects, single beam of light highlighting product',
    propsHints: ['fumée légère', 'particules en suspension', 'rayon de lumière dramatique'],
    colorPalettes: [
      ['noir profond', 'or', 'blanc lumière'],
      ['bleu nuit', 'argent', 'violet'],
    ],
    moodKeywords: ['révélation', 'premium', 'événement', 'mystérieux', 'majestueux'],
    headlinePatterns: [
      'Le voici : {product}',
      'Découvrez {product}',
      'Nouveau : {product}',
      '{product} — la révolution',
    ],
    ctaPool: ['Découvrir', 'Précommander', 'En avant-première', 'Voir le produit'],
    photoStyle:
      'product launch reveal photography, Apple keynote style, dramatic single source lighting',
    toneAdvice: 'Théâtral, premium, événementiel',
  },

  // ─── BRANDING / NOTORIÉTÉ ────────────────────────────────────────────────
  brandingMinimal: {
    id: 'branding-minimal',
    sector: 'général',
    useCase: 'branding',
    motiv: '',
    matchPatterns: [/branding|notori[ée]t[ée]|image\s*de\s*marque|brand|identit[ée]/i],
    composition:
      'minimal artistic composition, product as a sculpture on a colored pedestal, lots of negative space',
    lighting: 'soft directional lighting with strong shadow geometry',
    setting: 'pastel or earthy monochrome backdrop, geometric shapes echoing brand identity',
    propsHints: ['cube géométrique', 'ombre architecturale', 'fond monochrome'],
    colorPalettes: [
      ['terracotta', 'crème', 'noir'],
      ['vert sauge', 'crème', 'or vieilli'],
    ],
    moodKeywords: ['minimaliste', 'éditorial', 'artistique', 'iconique'],
    headlinePatterns: [
      '{brand}',
      '{product} — l\'essentiel',
      'L\'iconique signature',
    ],
    ctaPool: ['Découvrir la marque', 'Voir l\'univers', 'Explorer'],
    photoStyle:
      'editorial branding photography, gallery aesthetic, sculptural composition',
    toneAdvice: 'Minimaliste, iconique, éditorial',
  },
} as const;

const ALL_TEMPLATES: MarketingTemplate[] = Object.values(T).map((t) => ({
  id: t.id,
  sector: t.sector,
  useCase: t.useCase,
  matchPatterns: t.matchPatterns as unknown as RegExp[],
  composition: t.composition,
  lighting: t.lighting,
  setting: t.setting,
  propsHints: t.propsHints as unknown as string[],
  colorPalettes: t.colorPalettes as unknown as string[][],
  moodKeywords: t.moodKeywords as unknown as string[],
  headlinePatterns: t.headlinePatterns as unknown as string[],
  ctaPool: t.ctaPool as unknown as string[],
  photoStyle: t.photoStyle,
  toneAdvice: t.toneAdvice,
}));

export interface TemplateMatchInput {
  rawText: string;
  detectedCategory?: string | null;
  detectedSubcategory?: string | null;
  isPromo?: boolean;
  isLaunch?: boolean;
}

export interface TemplateMatchResult {
  template: MarketingTemplate;
  confidence: number;
  alternatives: MarketingTemplate[];
}

/**
 * Trouve le template marketing le plus pertinent.
 * Combine matching texte + catégorie détectée par vision pour un score plus robuste.
 */
export function matchMarketingTemplate(input: TemplateMatchInput): TemplateMatchResult {
  const text = `${input.rawText} ${input.detectedCategory ?? ''} ${input.detectedSubcategory ?? ''}`.toLowerCase();

  const scored = ALL_TEMPLATES.map((tpl) => {
    let score = 0;

    for (const pattern of tpl.matchPatterns) {
      if (pattern.test(text)) score += 10;
    }

    if (input.detectedCategory) {
      const cat = input.detectedCategory.toLowerCase();
      if (tpl.sector.toLowerCase() === cat) score += 15;
      if (tpl.sector.toLowerCase().includes(cat) || cat.includes(tpl.sector.toLowerCase())) score += 8;
    }

    if (input.isPromo && tpl.useCase === 'promo') score += 12;
    if (input.isLaunch && tpl.useCase === 'launch') score += 12;

    return { template: tpl, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      template: ALL_TEMPLATES.find((t) => t.id === 'ecommerce-generic')!,
      confidence: 0.3,
      alternatives: [],
    };
  }

  const top = scored[0];
  const maxPossible = 35;
  const confidence = Math.min(1, top.score / maxPossible);

  return {
    template: top.template,
    confidence,
    alternatives: scored.slice(1, 3).map((s) => s.template),
  };
}

export function listAllSectors(): string[] {
  return Array.from(new Set(ALL_TEMPLATES.map((t) => t.sector)));
}

export function getTemplateById(id: string): MarketingTemplate | null {
  return ALL_TEMPLATES.find((t) => t.id === id) ?? null;
}

export function getAllTemplates(): MarketingTemplate[] {
  return ALL_TEMPLATES.slice();
}

/**
 * Compose un visualConcept riche et photoréaliste à partir d'un template
 * et des informations détectées.
 */
export interface ComposeFromTemplateInput {
  template: MarketingTemplate;
  productName: string | null;
  productCategory: string | null;
  visionSummary: string | null;
  qualityMode: 'draft' | 'standard' | 'premium';
  aspectRatio?: string | null;
}

export function composeVisualConceptFromTemplate(input: ComposeFromTemplateInput): string {
  const { template, productName, visionSummary, qualityMode } = input;

  const parts: string[] = [];

  if (productName && visionSummary) {
    parts.push(`Hero shot of ${productName}, ${visionSummary}`);
  } else if (productName) {
    parts.push(`Hero shot of ${productName}`);
  } else if (visionSummary) {
    parts.push(visionSummary);
  } else {
    parts.push('Hero product shot');
  }

  parts.push(template.composition);
  parts.push(template.lighting);
  parts.push(template.setting);

  if (template.propsHints.length > 0) {
    parts.push(`Props: ${template.propsHints.slice(0, 3).join(', ')}`);
  }

  const palette = template.colorPalettes[0];
  if (palette && palette.length > 0) {
    parts.push(`Color palette: ${palette.join(', ')}`);
  }

  parts.push(template.photoStyle);

  if (qualityMode === 'premium') {
    parts.push(
      'shot on Hasselblad H6D-100c, 8K resolution, ultra-sharp details, photorealistic, magazine cover quality, perfect product clarity',
    );
  } else if (qualityMode === 'standard') {
    parts.push('professional commercial photography, sharp focus, photorealistic');
  }

  return parts.join(', ');
}

export function pickHeadlineFromTemplate(
  template: MarketingTemplate,
  productName: string | null,
  offer: string | null,
  index = 0,
): string {
  const pattern = template.headlinePatterns[index % template.headlinePatterns.length];
  return pattern
    .replace(/\{product\}/gi, productName ?? 'votre produit')
    .replace(/\{offer\}/gi, offer ?? '')
    .replace(/\{discount\}/gi, offer?.match(/\d+/)?.[0] ?? '30')
    .replace(/\{category\}/gi, template.sector)
    .replace(/\{brand\}/gi, productName ?? '')
    .replace(/\{year\}/gi, String(new Date().getFullYear()));
}

export function pickCtaFromTemplate(template: MarketingTemplate, index = 0): string {
  return template.ctaPool[index % template.ctaPool.length];
}
