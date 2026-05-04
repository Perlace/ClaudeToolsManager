import type { Tool, Category } from '../types'

export const CATEGORIES: Category[] = [
  {
    id: 'essential',
    name: 'Essential Plugins',
    description: 'Plugins indispensables pour améliorer Claude Code au quotidien',
    icon: '🌟',
    color: '#f59e0b',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'superpowers',
    name: 'Super Powers',
    description: 'Capacités avancées et augmentation de Claude Code',
    icon: '⚡',
    color: '#ff6b35',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'frontend',
    name: 'Front End Design',
    description: 'Conception UI/UX et génération de composants',
    icon: '🎨',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Analyse, refactoring et qualité du code',
    icon: '🔍',
    color: '#7c3aed',
    gradient: 'from-purple-600 to-indigo-600',
  },
  {
    id: 'security',
    name: 'Security Review',
    description: 'Détection de vulnérabilités et hardening',
    icon: '🔒',
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-600',
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    description: 'Optimisation pour les moteurs de recherche',
    icon: '📈',
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'responsive',
    name: 'Responsive Design',
    description: 'Adaptation mobile et multi-plateformes',
    icon: '📱',
    color: '#f59e0b',
    gradient: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'memory',
    name: 'Claude Memory',
    description: 'Gestion de la mémoire et du contexte Claude',
    icon: '🧠',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'tokens',
    name: 'Token Savings',
    description: "Optimisation des tokens et économie d'API",
    icon: '💰',
    color: '#f97316',
    gradient: 'from-amber-500 to-orange-500',
  },
]

export const TOOLS: Tool[] = [
  // ─── ESSENTIAL PLUGINS ─────────────────────────────────────────────────────
  {
    id: 'essential-statusline',
    name: 'Token Usage Statusline',
    shortDescription: 'Barre de statut : tokens utilisés, dispo et heure de reset',
    description:
      'Affiche en temps réel en bas de Claude Code : le nombre de tokens utilisés, le total disponible (200k), le pourcentage consommé, et une estimation de l\'heure à laquelle le contexte sera plein. Le script calcule le taux de consommation au fil de la conversation pour affiner la prédiction.',
    category: 'essential',
    tags: ['statusline', 'tokens', 'context', 'monitoring', 'ui'],
    tokenImpact: 'neutral',
    tokenEstimate: '0%',
    difficulty: 'easy',
    config: {
      settingsJson: {
        statusLine: {
          type: 'command',
          command: '~/.claude/statusline.sh',
        },
      },
      files: [
        {
          path: '~/.claude/statusline.sh',
          executable: true,
          content: `#!/bin/bash
INPUT=$(cat)

USED=$(echo "$INPUT" | jq -r '.context_window.total_input_tokens // 0')
TOTAL=$(echo "$INPUT" | jq -r '.context_window.context_window_size // 200000')
PCT=$(echo "$INPUT" | jq -r '(.context_window.used_percentage // 0) | floor')

SESSION_FILE="/tmp/ctm_session_\${USER}"
NOW=$(date +%s)

if [ ! -f "$SESSION_FILE" ]; then
  echo "$NOW $USED" > "$SESSION_FILE"
  RESET_STR="reset ~--:--"
else
  read START_TIME START_USED < "$SESSION_FILE"
  ELAPSED=$((NOW - START_TIME))
  DELTA=$((USED - START_USED))

  if [ "$DELTA" -gt 100 ] && [ "$ELAPSED" -gt 0 ]; then
    REMAINING=$((TOTAL - USED))
    SECONDS_LEFT=$(awk "BEGIN { printf \\"%d\\", ($REMAINING / $DELTA) * $ELAPSED }")
    RESET_EPOCH=$((NOW + SECONDS_LEFT))
    RESET_TIME=$(date -d "@$RESET_EPOCH" +"%H:%M" 2>/dev/null || date -r "$RESET_EPOCH" +"%H:%M" 2>/dev/null)
    RESET_STR="reset ~$RESET_TIME"
  else
    RESET_STR="reset ~--:--"
  fi
fi

echo "🪟 $USED / $TOTAL tokens (\${PCT}%) · $RESET_STR"
`,
        },
      ],
    },
    tips: [
      'La barre apparaît en bas de Claude Code dès le premier message après activation',
      'L\'heure de reset est une estimation basée sur ton rythme de consommation actuel',
      'L\'estimation s\'affine au fil de la conversation',
      'Nécessite jq installé sur ton système (sudo apt install jq)',
      'Désactiver le plugin supprime automatiquement le script et la config',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'essential-claudesnap',
    name: 'ClaudeSnap',
    shortDescription: 'Visual feedback Chrome extension — annotate UI elements for Claude Code',
    description:
      'ClaudeSnap est une extension Chrome qui permet d\'annoter visuellement n\'importe quel élément d\'une page web et de générer un prompt structuré prêt à coller dans Claude Code. Le prompt inclut le sélecteur CSS unique, le chemin DOM, les classes/IDs, les styles calculés, les dimensions et ton annotation. Claude Code reçoit tout le contexte nécessaire pour appliquer les modifications sans avoir à copier le code.',
    category: 'frontend',
    tags: ['chrome-extension', 'ui', 'visual', 'frontend', 'annotations', 'css'],
    tokenImpact: 'neutral',
    tokenEstimate: '0%',
    difficulty: 'easy',
    config: {
      claudeMd: `## ClaudeSnap — Visual UI Feedback

When a prompt contains a ClaudeSnap block (annotated HTML element with CSS selector, DOM path, computed styles, and dimensions), apply these rules:

- Use the provided CSS selector as the primary target — it is unique and precise
- Apply the requested change (annotation) to the identified element only
- Preserve all existing styles not mentioned in the annotation
- If dimensions or computed styles conflict with the requested change, flag it before modifying
- Prefer modifying existing CSS classes over adding inline styles
- Confirm the change with the selector used so the user can verify in DevTools`,
    },
    tips: [
      'Installe l\'extension depuis https://github.com/Perlace/claudesnap-extension',
      'Active le mode inspection, survole les éléments (surlignage teal) et clique pour annoter',
      'Décris ta modification dans la bulle d\'annotation, puis copie le prompt généré',
      'Colle le prompt directement dans Claude Code — tout le contexte CSS/DOM est inclus',
      'Le serveur MCP optionnel permet une connexion directe sans copier-coller',
    ],
    isEnabled: false,
    isImported: false,
    author: 'Perlace',
    homepage: 'https://github.com/Perlace/claudesnap-extension',
  },
  // ─── SUPER POWERS ──────────────────────────────────────────────────────────
  {
    id: 'sp-ruflo',
    name: 'Ruflo',
    shortDescription: '100+ agents spécialisés en swarm orchestration',
    description:
      "Ruflo (ex-ClaudeFlow) est une plateforme d'orchestration multi-agents qui s'installe comme plugin natif dans Claude Code. Elle déploie 100+ agents spécialisés (coding, testing, sécurité, DevOps, documentation) qui se coordonnent en topologie hiérarchique ou mesh. Inclut AgentDB (mémoire vectorielle HNSW persistante), 210 outils MCP, 12 workers background auto-déclenchés, et AIDefence (protection contre l'injection de prompts et exposition PII). Multi-LLM : Claude, GPT, Gemini, Ollama.",
    category: 'superpowers',
    tags: ['multi-agent', 'orchestration', 'swarm', 'mcp', 'automation'],
    tokenImpact: 'costs',
    tokenEstimate: '+300%',
    difficulty: 'advanced',
    config: {
      commands: [
        {
          name: 'ruflo-setup',
          content:
            '# Ruflo — Multi-Agent Orchestration\n\nInstalle et configure Ruflo dans Claude Code.\n\n## Installation\nDans Claude Code, exécuter:\n```\n/plugin install ruflo-core@ruflo\n```\n\n## Après installation\n- 100+ agents spécialisés disponibles nativement\n- 210 outils MCP activés automatiquement\n- AgentDB (mémoire vectorielle HNSW) initialisée\n- AIDefence (protection injection/PII) active\n- 12 workers background auto-déclenchés\n\n## Utilisation\nSpawner des agents spécialisés:\n- Agent coding : analyse et écrit du code\n- Agent security : audit vulnérabilités\n- Agent testing : génère et exécute des tests\n- Agent docs : documentation automatique\n\n## Ressources\n- GitHub: https://github.com/ruvnet/ruflo\n- Interface web: https://flo.ruv.io\n- Goal Planner: https://goal.ruv.io',
        },
      ],
    },
    tips: [
      'Installer avec /plugin install ruflo-core@ruflo depuis Claude Code',
      "L'AgentDB conserve la mémoire vectorielle entre toutes les sessions",
      'AIDefence bloque automatiquement les injections de prompts malveillants',
      'Combinez plusieurs agents en parallèle pour les gros projets (coding + security + tests)',
      'Interface de gestion visuelle disponible sur flo.ruv.io',
    ],
    isEnabled: false,
    isImported: false,
    author: 'ruvnet',
    homepage: 'https://github.com/ruvnet/ruflo',
  },
  {
    id: 'sp-ultrareview',
    name: 'Ultra Review',
    shortDescription: 'Review multi-agents en parallèle',
    description:
      "Lance plusieurs agents Claude en parallèle pour analyser votre code sous différents angles : architecture, performance, sécurité, maintenabilité. Chaque agent se spécialise dans un domaine et les résultats sont consolidés. Particulièrement puissant sur les branches avant merge.",
    category: 'superpowers',
    tags: ['review', 'multi-agent', 'qualité'],
    tokenImpact: 'costs',
    tokenEstimate: '+400%',
    difficulty: 'easy',
    config: {
      commands: [
        {
          name: 'ultrareview',
          content:
            '# Ultra Review\n\nLance une review multi-agents du code courant.\n\nUtilisation: `/ultrareview` ou `/ultrareview <PR#>`\n\nAnalyse:\n- Architecture & design patterns\n- Sécurité (OWASP Top 10)\n- Performance & goulots\n- Maintenabilité & DRY\n- Tests & couverture',
        },
      ],
    },
    tips: [
      'Utilisez /ultrareview sur votre branche avant tout merge',
      'Ajoutez un numéro de PR pour une review ciblée: /ultrareview 42',
      "Idéal pour les refactorings importants ou les fonctionnalités critiques",
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sp-init-master',
    name: 'Init Master',
    shortDescription: 'Initialise CLAUDE.md intelligemment',
    description:
      "Analyse en profondeur votre codebase (structure, dépendances, patterns, conventions) et génère un CLAUDE.md complet et adapté. Documente l'architecture, les conventions de code, les commandes clés, les points d'attention et le contexte du projet pour que Claude soit opérationnel immédiatement.",
    category: 'superpowers',
    tags: ['init', 'documentation', 'context'],
    tokenImpact: 'saves',
    tokenEstimate: '-25%',
    difficulty: 'easy',
    config: {
      commands: [
        {
          name: 'init-smart',
          content:
            "# Init Master\n\nGénère un CLAUDE.md complet pour ce projet.\n\nAnalyse et documente:\n- Stack technique et versions\n- Structure des dossiers\n- Conventions de nommage détectées\n- Commandes de dev/build/test\n- Points d'attention (auth, DB, API clés)\n- Workflow de déploiement\n- Patterns architecturaux",
        },
      ],
    },
    tips: [
      'Lancez /init-smart en début de chaque nouveau projet',
      'Re-lancez après des refactorings majeurs pour garder la doc à jour',
      'Le CLAUDE.md généré réduit significativement les tokens de context',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sp-context-compressor',
    name: 'Context Compressor',
    shortDescription: 'Compresse le contexte automatiquement',
    description:
      "Surveille la taille de votre fenêtre de contexte et déclenche une compression intelligente quand elle approche de la limite. Préserve les informations critiques (décisions d'architecture, erreurs rencontrées, état du projet) tout en supprimant le bruit. Utilise /compact en arrière-plan.",
    category: 'superpowers',
    tags: ['context', 'tokens', 'auto'],
    tokenImpact: 'saves',
    tokenEstimate: '-35%',
    difficulty: 'medium',
    config: {
      claudeMd:
        '## Context Management\n\nQuand le contexte devient long:\n- Propose automatiquement une compression avec /compact\n- Conserve: décisions techniques, erreurs résolues, état des tâches\n- Supprime: logs verbeux, fichiers entiers déjà analysés, discussions résolues\n- Signale quand le contexte approche 80% de la limite',
    },
    tips: [
      'Active en début de sessions longues pour éviter les coupures',
      "Fonctionne mieux avec l'outil Memory Architect activé aussi",
      'La compression préserve le contexte des 3 derniers échanges',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sp-memory-architect',
    name: 'Memory Architect',
    shortDescription: 'Système de mémoire persistante structuré',
    description:
      "Conçoit et maintient automatiquement un système de mémoire fichier pour Claude. Crée des fichiers mémoire structurés (user.md, project.md, feedback.md) dans ~/.claude/projects/, les met à jour après chaque session importante et les charge automatiquement dans les nouveaux contextes.",
    category: 'superpowers',
    tags: ['memory', 'persistence', 'context'],
    tokenImpact: 'saves',
    tokenEstimate: '-20%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Memory System\n\nGère la mémoire persistante:\n- Après chaque session: propose de sauvegarder les décisions importantes\n- Format mémoire: frontmatter YAML + contenu markdown\n- Types: user (préférences), project (état), feedback (corrections), reference (liens)\n- Charge les fichiers mémoire pertinents au début de chaque conversation\n- N'enregistre jamais: code, git history, docs déjà dans le repo",
    },
    tips: [
      'Combinez avec Context Compressor pour une gestion optimale',
      'Les feedbacks enregistrés évitent de répéter les corrections',
      'Consultez MEMORY.md pour voir tous les souvenirs indexés',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sp-task-orchestrator',
    name: 'Task Orchestrator',
    shortDescription: 'Décompose et suit les tâches complexes',
    description:
      "Transforme les demandes complexes en plans d'action structurés avec des sous-tâches trackées. Utilise les outils TodoWrite/TodoRead de Claude Code pour maintenir un état de progression, identifier les dépendances et éviter les oublis sur les longs chantiers.",
    category: 'superpowers',
    tags: ['tasks', 'planning', 'tracking'],
    tokenImpact: 'neutral',
    tokenEstimate: '~0%',
    difficulty: 'easy',
    config: {
      claudeMd:
        '## Task Management\n\nPour chaque tâche non-triviale:\n- Décompose en sous-tâches SMART (spécifiques, mesurables)\n- Crée un plan avec TaskCreate avant de commencer\n- Marque chaque sous-tâche completed immédiatement après\n- Signale les blockers et dépendances\n- Résume le bilan en fin de session',
    },
    tips: [
      'Active pour les refactorings multi-fichiers ou les nouvelles fonctionnalités',
      'La décomposition en tâches permet de reprendre facilement après interruption',
      'Fonctionne en synergie avec Memory Architect',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sp-parallel-agents',
    name: 'Parallel Agents',
    shortDescription: 'Exécution parallèle de sous-agents',
    description:
      "Tire parti de la capacité de Claude Code à spawner plusieurs agents simultanément. Pour les tâches indépendantes (ex: analyser 3 microservices différents), lance des agents en parallèle avec `run_in_background: true` et consolide les résultats. Réduit drastiquement le temps d'exécution.",
    category: 'superpowers',
    tags: ['agents', 'parallel', 'performance'],
    tokenImpact: 'costs',
    tokenEstimate: '+150%',
    difficulty: 'advanced',
    config: {
      claudeMd:
        "## Parallel Processing\n\nPour les tâches parallélisables:\n- Identifie les sous-tâches indépendantes (pas de dépendances entre elles)\n- Lance plusieurs agents avec run_in_background: true\n- N'utilise pas les agents en parallèle si les tâches sont séquentielles\n- Consolide les résultats dans un rapport unifié\n- Signale clairement quand le parallélisme est utilisé",
    },
    tips: [
      "Idéal pour analyser plusieurs fichiers/modules simultanément",
      "Économise du temps mais coûte plus de tokens — à utiliser sur de grosses tâches",
      'Indiquer "en parallèle" dans votre prompt active automatiquement ce mode',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sp-smart-compact',
    name: 'Smart Compact',
    shortDescription: 'Compaction intelligente avec sauvegarde',
    description:
      "Avant chaque /compact, sauvegarde automatiquement l'état complet de la session: fichiers modifiés, décisions prises, erreurs rencontrées, plan en cours. Après la compaction, charge immédiatement ce snapshot pour que Claude reprenne sans perte d'information.",
    category: 'superpowers',
    tags: ['compact', 'session', 'continuité'],
    tokenImpact: 'saves',
    tokenEstimate: '-40%',
    difficulty: 'medium',
    config: {
      commands: [
        {
          name: 'smart-compact',
          content:
            "# Smart Compact\n\nCompacte la session en préservant le contexte essentiel.\n\n1. Sauvegarde: fichiers modifiés, plan actif, décisions, erreurs\n2. Résume en ≤200 mots l'état du projet\n3. Lance /compact\n4. Recharge immédiatement le snapshot sauvegardé\n5. Confirme la reprise avec le résumé",
        },
      ],
    },
    tips: [
      'Utilisez /smart-compact plutôt que /compact seul',
      'Le snapshot est sauvegardé dans ~/.claude/projects/*/memory/',
      'La reprise après compaction est quasi-transparente',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sp-prompt-engineer',
    name: 'Prompt Engineer',
    shortDescription: 'Optimise les prompts pour moins de tokens',
    description:
      "Analyse vos prompts et les reformule pour obtenir de meilleurs résultats avec moins de tokens. Applique les meilleures pratiques: instructions directes, exemples concis, format de sortie spécifié, contexte minimal suffisant. Peut réduire les coûts de 30 à 50% sur des usages répétitifs.",
    category: 'superpowers',
    tags: ['prompt', 'optimisation', 'tokens'],
    tokenImpact: 'saves',
    tokenEstimate: '-40%',
    difficulty: 'medium',
    config: {
      commands: [
        {
          name: 'optimize-prompt',
          content:
            "# Optimize Prompt\n\nOptimise le prompt fourni pour réduire les tokens sans perte de qualité.\n\nAnalyse:\n- Supprime les répétitions et le remplissage\n- Clarifie l'instruction principale\n- Ajoute un format de sortie explicite\n- Réduit le contexte au strict nécessaire\n- Estime le gain en tokens",
        },
      ],
    },
    tips: [
      'Donnez votre prompt original: /optimize-prompt "votre prompt ici"',
      'Particulièrement utile pour les prompts répétitifs (templates, CI/CD)',
      'Combinez avec Cache Optimizer pour maximiser les économies',
    ],
    isEnabled: false,
    isImported: false,
  },

  // ─── FRONT END DESIGN ──────────────────────────────────────────────────────
  {
    id: 'fe-component-forge',
    name: 'Component Forge',
    shortDescription: 'Génère des composants UI depuis une description',
    description:
      'Transforme des descriptions textuelles en composants React/Vue/Svelte complets et accessibles. Respecte votre design system existant (couleurs, espacements, typographie détectés), génère les types TypeScript, les props, et les variantes. Production-ready dès la sortie.',
    category: 'frontend',
    tags: ['composants', 'react', 'vue', 'génération'],
    tokenImpact: 'neutral',
    tokenEstimate: '~0%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Component Generation\n\nLors de la création de composants:\n- Détecte le framework (React/Vue/Svelte) depuis le package.json\n- Respecte le design system existant (tailwind.config, tokens CSS)\n- Génère TypeScript avec types complets\n- Inclut aria-labels et attributs d'accessibilité\n- Crée des variantes (size, variant, state) si pertinent\n- Ajoute les tests unitaires si le projet en a",
    },
    tips: [
      'Décrivez le composant en langage naturel avec ses variantes',
      'Mentionnez le framework pour forcer React/Vue/Svelte',
      "Le design system est auto-détecté si tailwind.config.js existe",
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'fe-css-alchemist',
    name: 'CSS Alchemist',
    shortDescription: 'Transforme et optimise les CSS complexes',
    description:
      "Expert CSS qui analyse et optimise votre CSS/SCSS/Tailwind. Supprime les doublons, convertit le CSS legacy en Tailwind, génère des variables CSS personnalisées, optimise les sélecteurs pour la performance et assure la cohérence. Peut transformer du Figma-copy en CSS propre.",
    category: 'frontend',
    tags: ['css', 'tailwind', 'optimisation', 'scss'],
    tokenImpact: 'neutral',
    tokenEstimate: '~0%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## CSS Standards\n\nPour tout le CSS/styling:\n- Préfère Tailwind si le projet l'utilise\n- Évite les styles inline sauf cas exceptionnel\n- Utilise les variables CSS pour les valeurs réutilisées\n- Groupes les variantes de façon logique\n- Nomme les classes selon BEM si CSS modules\n- Signale les sélecteurs coûteux en performance",
    },
    tips: [
      'Collez votre CSS Figma brut pour une transformation en Tailwind',
      'Demandez une analyse de performance CSS pour les pages critiques',
      'La conversion SCSS→Tailwind peut réduire la taille du bundle de 40%',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'fe-design-tokens',
    name: 'Design Token Manager',
    shortDescription: 'Crée et gère les tokens de design system',
    description:
      "Extrait les valeurs réutilisées de votre code (couleurs, espacements, radii, ombres) et les transforme en design tokens structurés. Génère les configs pour Tailwind, CSS custom properties, Style Dictionary. Assure la cohérence visuelle à travers tout le projet.",
    category: 'frontend',
    tags: ['design-system', 'tokens', 'tailwind', 'cohérence'],
    tokenImpact: 'saves',
    tokenEstimate: '-15%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Design Tokens\n\nPour maintenir la cohérence visuelle:\n- Référence toujours les tokens définis (tailwind.config, :root) plutôt que des valeurs hardcodées\n- Signale quand une valeur n'existe pas dans le design system\n- Propose d'ajouter les nouvelles valeurs aux tokens si réutilisées\n- Utilise les noms sémantiques (color-primary vs #ff6b35)",
    },
    tips: [
      'Activez tôt dans le projet pour établir les conventions',
      'Les tokens sémantiques facilitent les thèmes dark/light',
      'Export vers Figma Variables disponible sur demande',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'fe-animation-crafter',
    name: 'Animation Crafter',
    shortDescription: 'Génère des animations CSS/JS fluides',
    description:
      "Crée des animations web performantes (CSS keyframes, transitions, Framer Motion, GSAP) en respectant prefers-reduced-motion. Génère les courbes de bezier appropriées, les durées optimales selon les guidelines Material/Apple, et les animations sur-mesure depuis une description.",
    category: 'frontend',
    tags: ['animation', 'css', 'framer-motion', 'ux'],
    tokenImpact: 'neutral',
    tokenEstimate: '~0%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Animation Standards\n\nPour toute animation:\n- Toujours inclure @media (prefers-reduced-motion: reduce)\n- Utiliser transform/opacity (pas width/height) pour les performances\n- Durées: micro 100-200ms, feedback 200-400ms, transition 300-500ms\n- Courbes: ease-out pour entrées, ease-in pour sorties, ease-in-out pour transitions\n- Framer Motion si React, sinon CSS natif en priorité",
    },
    tips: [
      "Décrivez l'animation: 'carte qui apparaît depuis le bas avec fade'",
      'Le respect de prefers-reduced-motion est automatique',
      'Les animations CSS sont 60fps même sur mobile bas de gamme',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'fe-accessibility-guard',
    name: 'Accessibility Guard',
    shortDescription: 'Vérifie et corrige la conformité WCAG 2.1',
    description:
      "Analyse votre code frontend pour détecter les violations d'accessibilité WCAG 2.1 niveau AA. Vérifie les contrastes, la navigation clavier, les attributs ARIA, les textes alternatifs, les formulaires et la structure sémantique. Propose des corrections concrètes avec exemples de code.",
    category: 'frontend',
    tags: ['accessibilité', 'wcag', 'aria', 'a11y'],
    tokenImpact: 'neutral',
    tokenEstimate: '+10%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Accessibility Requirements\n\nPour tout code frontend:\n- Ajouter aria-label sur les boutons sans texte visible\n- Assurer un ratio de contraste ≥4.5:1 (texte normal) ou 3:1 (grand texte)\n- Tous les inputs ont un label associé\n- Navigation keyboard complète (focus visible, tab order logique)\n- Images décoratives ont alt='', images informatives ont alt descriptif\n- Signaler les violations WCAG 2.1 AA détectées",
    },
    tips: [
      'Lancez un audit sur les pages à fort trafic en priorité',
      'Le contraste est souvent négligé sur les dark themes',
      'WCAG AA est requis légalement dans beaucoup de pays pour les sites publics',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'fe-storybook-gen',
    name: 'Storybook Generator',
    shortDescription: 'Génère des stories Storybook complètes',
    description:
      "Analyse vos composants React/Vue et génère automatiquement des stories Storybook complètes: histoire par défaut, toutes les variantes, états (loading, error, empty), contrôles configurés et documentation. Accélère drastiquement la création d'une librairie de composants documentée.",
    category: 'frontend',
    tags: ['storybook', 'documentation', 'composants', 'testing'],
    tokenImpact: 'neutral',
    tokenEstimate: '+20%',
    difficulty: 'easy',
    config: {
      commands: [
        {
          name: 'gen-stories',
          content:
            "# Generate Storybook Stories\n\nGénère des stories Storybook pour le composant spécifié.\n\nCrée:\n- Story Default avec les props typiques\n- Stories pour chaque variante détectée\n- Stories pour les états edge (loading, error, empty, long text)\n- ArgTypes configurés pour Storybook Controls\n- JsDoc pour la documentation auto-générée",
        },
      ],
    },
    tips: [
      'Pointez vers un composant: /gen-stories src/components/Button.tsx',
      'Les stories générées sont utilisables en tests de non-régression visuelle',
      'Compatible Storybook 7 et 8',
    ],
    isEnabled: false,
    isImported: false,
  },

  // ─── CODE REVIEW ───────────────────────────────────────────────────────────
  {
    id: 'cr-deep-reviewer',
    name: 'Deep Reviewer',
    shortDescription: 'Review exhaustive avec scoring qualité',
    description:
      "Effectue une analyse de code en profondeur sur plusieurs dimensions: lisibilité, maintenabilité, performance, testabilité et correctness. Attribue un score 0-100 sur chaque axe avec des recommendations prioritisées (critique/majeur/mineur). Idéal avant les merges sur main.",
    category: 'code-review',
    tags: ['review', 'qualité', 'scoring', 'best-practices'],
    tokenImpact: 'costs',
    tokenEstimate: '+80%',
    difficulty: 'easy',
    config: {
      commands: [
        {
          name: 'deep-review',
          content:
            "# Deep Code Review\n\nReview complète du code avec scoring.\n\nAnalyse (score 0-100):\n- Lisibilité & nommage\n- Architecture & patterns\n- Performance & complexité\n- Testabilité & couplage\n- Correctness & edge cases\n\nFormat: Score global + détail par axe + top 5 recommandations priorisées",
        },
      ],
    },
    tips: [
      'Utilisez sur les fichiers critiques: /deep-review src/auth/service.ts',
      'Le scoring permet de suivre la qualité dans le temps',
      'Couplé avec Ultra Review pour une analyse vraiment exhaustive',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'cr-refactor-assistant',
    name: 'Refactor Assistant',
    shortDescription: 'Suggestions de refactoring intelligentes',
    description:
      "Détecte et propose des refactorings concrets: extraction de fonctions/classes, application de patterns (Strategy, Factory, Repository), élimination de code dupliqué, simplification de logique complexe. Montre le before/after pour chaque suggestion. Jamais de sur-ingénierie.",
    category: 'code-review',
    tags: ['refactoring', 'patterns', 'clean-code', 'DRY'],
    tokenImpact: 'neutral',
    tokenEstimate: '+20%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Refactoring Principles\n\nLors de tout refactoring:\n- Pas d'over-engineering: 3 utilisations similaires avant abstraction\n- Montrer le before/after complet\n- Un refactoring à la fois, testable isolément\n- Privilégier la lisibilité sur la concision\n- Ne jamais ajouter de features pendant un refactoring\n- Signaler les dépendances impactées",
    },
    tips: [
      'Demandez une analyse avant de commencer: "quels refactorings proposes-tu?"',
      "Le mode 'safe refactor' préserve les interfaces publiques",
      'La règle des 3: dupliqué 3 fois = candidat à l\'abstraction',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'cr-test-generator',
    name: 'Test Generator',
    shortDescription: 'Génère des tests unitaires et d\'intégration',
    description:
      "Génère automatiquement des tests unitaires, d'intégration et end-to-end à partir de votre code. Couvre les cas nominaux, les edge cases et les cas d'erreur. S'adapte au framework de test existant (Jest, Vitest, PHPUnit, Pytest). Vise une couverture de 80%+ sur les fonctions critiques.",
    category: 'code-review',
    tags: ['tests', 'jest', 'vitest', 'coverage'],
    tokenImpact: 'neutral',
    tokenEstimate: '+30%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Test Generation\n\nLors de la génération de tests:\n- Détecter le framework existant (Jest/Vitest/PHPUnit/Pytest)\n- Couvrir: happy path, edge cases, erreurs, null/undefined\n- Ne pas mocker la BDD en tests d'intégration (leçon apprise)\n- Nommer les tests: should [comportement] when [contexte]\n- Grouper par fichier/classe testé\n- Viser 80%+ sur les fonctions critiques (auth, paiement, data)",
    },
    tips: [
      'Précisez le type: "génère des tests unitaires pour cette fonction"',
      'Les tests générés couvrent automatiquement les cas null/undefined',
      'Compatible avec coverage reports (Jest --coverage, Vitest)',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'cr-doc-writer',
    name: 'Doc Writer',
    shortDescription: 'Génère la documentation technique du code',
    description:
      "Génère une documentation technique claire et utile: JSDoc/PHPDoc pour les fonctions, README pour les modules, commentaires pour les algorithmes complexes. Documente uniquement ce qui n'est pas évident (le WHY, pas le WHAT). Suit les standards du projet existant.",
    category: 'code-review',
    tags: ['documentation', 'jsdoc', 'readme', 'comments'],
    tokenImpact: 'neutral',
    tokenEstimate: '+15%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Documentation Standards\n\nPour la documentation:\n- Commenter uniquement le WHY (contrainte cachée, workaround, invariant non-évident)\n- Ne JAMAIS décrire ce que le code fait (les noms l'indiquent déjà)\n- JSDoc sur les fonctions publiques avec @param/@returns/@throws\n- Un README par module complexe\n- Pas de blocs multi-lignes sauf pour les algorithmes complexes\n- Pas de références à la tâche courante ('added for issue #123')",
    },
    tips: [
      'La doc inutile coûte des tokens — utilisez avec discernement',
      'Focus sur les fonctions publiques et les algorithmes non-triviaux',
      'Demandez: "documente uniquement les parties non-évidentes"',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'cr-perf-auditor',
    name: 'Perf Auditor',
    shortDescription: 'Identifie et corrige les bottlenecks',
    description:
      "Analyse le code pour détecter les problèmes de performance: requêtes N+1, boucles dans les renders, imports non-optimisés, mémoire non libérée, algorithmes O(n²), requêtes synchrones bloquantes. Propose des optimisations concrètes avec estimation de gain.",
    category: 'code-review',
    tags: ['performance', 'optimisation', 'N+1', 'profiling'],
    tokenImpact: 'neutral',
    tokenEstimate: '+25%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Performance Checklist\n\nDétection automatique de:\n- Requêtes N+1 (boucles + requêtes DB)\n- Re-renders inutiles React (props instables, missing useMemo)\n- Imports barrel trop larges (tree-shaking impossible)\n- Timeouts/intervals non nettoyés (memory leaks)\n- Appels synchrones bloquants dans des contextes async\n- Algorithmes de complexité sous-optimale (O(n²) évitable)",
    },
    tips: [
      'Les requêtes N+1 sont la cause #1 de lenteur en Symfony/Laravel',
      'React DevTools Profiler + cet outil = combo redoutable',
      'Estimez le gain avant d\'optimiser ("est-ce que ça vaut le coût ?")',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'cr-dead-code-hunter',
    name: 'Dead Code Hunter',
    shortDescription: 'Détecte et supprime le code mort',
    description:
      "Identifie le code non utilisé: fonctions/classes/variables jamais appelées, imports inutilisés, composants orphelins, routes sans handler, CSS non référencé, feature flags toujours à false. Propose une suppression sécurisée en tenant compte des exports et de l'API publique.",
    category: 'code-review',
    tags: ['nettoyage', 'dead-code', 'bundle-size', 'maintenance'],
    tokenImpact: 'saves',
    tokenEstimate: '-10%',
    difficulty: 'medium',
    config: {
      commands: [
        {
          name: 'hunt-dead-code',
          content:
            "# Dead Code Hunter\n\nDetecte le code mort dans le projet.\n\nAnalyse:\n- Imports non utilisés\n- Fonctions/variables jamais appelées\n- Composants React/Vue non référencés\n- Routes sans handler\n- Feature flags ou conditions toujours vraies/fausses\n\nPropose une liste de suppressions sécurisées (ne supprime pas l'API publique)",
        },
      ],
    },
    tips: [
      'Lancez avant chaque release pour alléger le bundle',
      'Le code mort coûte en maintenance ET en bundle size',
      'Vérifiez manuellement avant suppression si exports publics',
    ],
    isEnabled: false,
    isImported: false,
  },

  // ─── SECURITY ──────────────────────────────────────────────────────────────
  {
    id: 'sec-owasp-guardian',
    name: 'OWASP Guardian',
    shortDescription: 'Vérifie contre le Top 10 OWASP',
    description:
      "Analyse systématiquement votre code contre les 10 vulnérabilités OWASP les plus critiques (2023): injection, broken auth, XSS, IDOR, misconfiguration, etc. Donne un rapport priorisé avec niveau de criticité (Critical/High/Medium/Low) et exemples de correction.",
    category: 'security',
    tags: ['owasp', 'injection', 'auth', 'xss', 'sécurité'],
    tokenImpact: 'neutral',
    tokenEstimate: '+30%',
    difficulty: 'easy',
    config: {
      claudeMd:
        '## Security - OWASP Top 10\n\nVérification automatique lors de code review:\n- A01: Broken Access Control — vérifier chaque endpoint\n- A02: Cryptographic Failures — jamais MD5/SHA1 pour les mots de passe\n- A03: Injection — requêtes paramétrées TOUJOURS\n- A05: Security Misconfiguration — headers HTTP, CORS restrictif\n- A07: Auth Failures — tokens expiration, session invalidation\n- A08: Data Integrity — valider les dépendances et les deserializations\nSignaler en [CRITICAL]/[HIGH]/[MEDIUM]/[LOW]',
    },
    tips: [
      'Activez en permanence sur les projets avec données utilisateurs',
      'CRITICAL = blocker avant déploiement, HIGH = sprint suivant',
      'Couplé avec Dependency Shield pour une couverture complète',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sec-dependency-shield',
    name: 'Dependency Shield',
    shortDescription: 'Audit CVE des dépendances npm/composer',
    description:
      "Analyse vos dépendances (package.json, composer.json) pour détecter les CVE connues. Identifie les packages obsolètes, les versions avec des exploits connus, et propose des mises à jour sécurisées. Tient compte des contraintes de semver pour éviter les breaking changes.",
    category: 'security',
    tags: ['dependencies', 'cve', 'npm', 'composer', 'vulnérabilités'],
    tokenImpact: 'neutral',
    tokenEstimate: '+20%',
    difficulty: 'easy',
    config: {
      commands: [
        {
          name: 'audit-deps',
          content:
            "# Dependency Audit\n\nAudit de sécurité des dépendances.\n\nAnalyse:\n- CVE connues dans les dépendances directes et transitives\n- Packages abandonnés (dernier commit >2 ans)\n- Packages avec typosquatting potentiel\n- Versions disponibles avec corrections de sécurité\n\nPropose: mises à jour compatibles semver triées par criticité",
        },
      ],
    },
    tips: [
      "Lancez après chaque npm install ou composer update",
      'Les dépendances transitives sont aussi analysées (souvent oubliées)',
      'Intégrez dans votre pipeline CI pour une surveillance continue',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sec-secret-detector',
    name: 'Secret Detector',
    shortDescription: 'Détecte les credentials exposés dans le code',
    description:
      "Scanne votre codebase pour détecter les secrets accidentellement committés: API keys, tokens JWT, mots de passe hardcodés, credentials DB, clés SSH, certificats. Vérifie .env.example, les commentaires, les logs, les tests. Propose une rotation et l'ajout à .gitignore.",
    category: 'security',
    tags: ['secrets', 'api-keys', 'credentials', 'gitignore'],
    tokenImpact: 'neutral',
    tokenEstimate: '+15%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Secret Detection\n\nVérification automatique:\n- Ne jamais écrire de valeur d'API key/token/password dans le code\n- Toujours utiliser process.env.VAR_NAME ou $_ENV['VAR']\n- Signaler si un secret est détecté dans un commentaire ou log\n- Vérifier que .env n'est pas dans .gitignore si non présent\n- .env.example doit exister avec des valeurs placeholder\n- Signaler les patterns de secrets: sk-..., ghp_..., AKIA...",
    },
    tips: [
      'Scannez avant chaque commit sur un nouveau projet',
      'Les secrets dans les commentaires sont souvent oubliés',
      'Activez git-secrets ou gitleaks en pre-commit hook pour automatiser',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sec-sql-shield',
    name: 'SQL Shield',
    shortDescription: 'Détecte les injections SQL',
    description:
      "Analyse toutes les requêtes SQL et les interactions DB pour détecter les risques d'injection: concaténation de strings dans les requêtes, paramètres non validés, procédures stockées vulnérables, ORM mal utilisé. Propose des requêtes paramétrées sécurisées pour chaque cas.",
    category: 'security',
    tags: ['sql', 'injection', 'orm', 'database'],
    tokenImpact: 'neutral',
    tokenEstimate: '+10%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## SQL Security\n\nRègles strictes pour les requêtes DB:\n- JAMAIS de concaténation de variable dans une requête SQL\n- Toujours les prepared statements / paramètres bindés\n- ORM (Doctrine/Eloquent): utiliser les méthodes du query builder, pas le raw SQL sauf nécessité\n- Si raw SQL nécessaire: toujours ->execute([':param' => $value])\n- Valider et typer les IDs avant toute requête\n- Signaler [SQL INJECTION RISK] sur chaque violation",
    },
    tips: [
      "Les ORMs protègent mais le raw SQL dans les ORMs reste vulnérable",
      "Symfony/Doctrine: préférez le DQL ou le QueryBuilder",
      'Testez avec SQLmap en environnement de test pour valider',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sec-xss-protector',
    name: 'XSS Protector',
    shortDescription: 'Détecte et corrige les vulnérabilités XSS',
    description:
      "Identifie les risques de Cross-Site Scripting dans votre code frontend et backend: dangerouslySetInnerHTML non sécurisé, innerHTML avec données utilisateur, template literals dans le DOM, attributs href avec javascript:, eval() et Function(). Propose des sanitizations appropriées.",
    category: 'security',
    tags: ['xss', 'sanitization', 'dom', 'frontend'],
    tokenImpact: 'neutral',
    tokenEstimate: '+10%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## XSS Prevention\n\nProtection XSS systématique:\n- React: ne JAMAIS utiliser dangerouslySetInnerHTML avec données utilisateur\n- Si dangerouslySetInnerHTML nécessaire: DOMPurify.sanitize() OBLIGATOIRE\n- Pas de innerHTML = userContent directement\n- Href: valider que l'URL ne commence pas par javascript:\n- Backend PHP: htmlspecialchars() ou strip_tags() sur tout output user\n- Signaler [XSS RISK] sur chaque violation",
    },
    tips: [
      'DOMPurify est la référence pour sanitizer le HTML côté client',
      'Le XSS stocké (en BDD) est plus dangereux que le reflected',
      'Les éditeurs rich-text sont les zones les plus risquées',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'sec-auth-auditor',
    name: 'Auth Auditor',
    shortDescription: 'Audite les flux d\'authentification',
    description:
      "Analyse en profondeur vos mécanismes d'auth: JWT (expiration, algorithme, révocation), sessions (fixation, invalidation), OAuth (PKCE, state param), CSRF tokens, rate limiting, brute force protection. Couvre aussi les autorisations (RBAC, ABAC, vérifications manquantes).",
    category: 'security',
    tags: ['auth', 'jwt', 'session', 'oauth', 'rbac'],
    tokenImpact: 'costs',
    tokenEstimate: '+40%',
    difficulty: 'advanced',
    config: {
      claudeMd:
        "## Authentication & Authorization\n\nAudit auth systématique:\n- JWT: vérifier expiration courte (<1h access token), refresh token rotation\n- Sessions: HttpOnly + Secure + SameSite=Strict sur les cookies\n- Chaque route protégée: vérifier l'auth ET l'autorisation\n- Rate limiting sur login (≤5 tentatives/minute)\n- CSRF token sur toutes les mutations (POST/PUT/DELETE)\n- Mots de passe: bcrypt/argon2 UNIQUEMENT, jamais MD5/SHA\n- Signaler [AUTH VULNERABILITY] sur chaque problème",
    },
    tips: [
      'Vérifiez chaque endpoint: est-ce qu\'il vérifie vraiment qui peut y accéder?',
      'Le JWT HS256 sans clé secrète forte = équivalent pas d\'auth',
      'Test: pouvez-vous accéder aux ressources des autres users?',
    ],
    isEnabled: false,
    isImported: false,
  },

  // ─── SEO ───────────────────────────────────────────────────────────────────
  {
    id: 'seo-meta-optimizer',
    name: 'Meta Optimizer',
    shortDescription: 'Optimise toutes les balises meta',
    description:
      "Génère et optimise l'ensemble des meta tags: title (50-60 chars), description (150-160 chars), robots, canonical, hreflang pour l'i18n, author, keywords. Valide les longueurs, détecte les duplications et assure la cohérence avec le contenu de la page.",
    category: 'seo',
    tags: ['meta', 'title', 'description', 'canonical'],
    tokenImpact: 'neutral',
    tokenEstimate: '+10%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## SEO - Meta Tags\n\nPour toute page HTML:\n- <title>: 50-60 caractères max, mot-clé principal en premier\n- <meta description>: 150-160 caractères, inclure CTA naturel\n- <link rel='canonical'>: TOUJOURS sur les pages indexables\n- Pas de meta keywords (ignoré par Google depuis 2009)\n- hreflang si site multilingue (FR/EN/etc.)\n- robots: index,follow par défaut, noindex sur /admin /merci /panier\n- Signaler si title ou description manquant ou hors limites",
    },
    tips: [
      'Un title unique par page est critique pour le SEO',
      'Le canonical évite la duplicate content penalty',
      'Pour Symfony/Twig: utilisez le bundle SeoBundle ou sonata-project',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'seo-schema-architect',
    name: 'Schema Architect',
    shortDescription: 'Génère les données structurées JSON-LD',
    description:
      "Génère les structured data JSON-LD (Schema.org) adaptées à votre type de page: Organization, LocalBusiness, Product, Article, FAQ, BreadcrumbList, Review. Augmente les chances d'obtenir des Rich Snippets dans les SERPs Google, améliorant le CTR de 20 à 30%.",
    category: 'seo',
    tags: ['schema', 'json-ld', 'rich-snippets', 'structured-data'],
    tokenImpact: 'neutral',
    tokenEstimate: '+15%',
    difficulty: 'medium',
    config: {
      commands: [
        {
          name: 'gen-schema',
          content:
            "# Generate Schema.org JSON-LD\n\nGénère les données structurées pour cette page.\n\nDétecte automatiquement le type (Organization/LocalBusiness/Article/FAQ/Product/etc.) et génère le JSON-LD complet, valide, prêt à intégrer dans le <head>.\n\nValidation Google Rich Results Test incluse.",
        },
      ],
    },
    tips: [
      "FAQ schema = rich snippets directs dans les résultats Google",
      'LocalBusiness schema est essentiel pour le SEO local',
      'Validez avec le Rich Results Test de Google après intégration',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'seo-sitemap-builder',
    name: 'Sitemap Builder',
    shortDescription: 'Génère sitemap.xml et robots.txt optimisés',
    description:
      "Crée des sitemaps XML (et sitemap index pour les grands sites) depuis vos routes/controllers. Configure robots.txt avec les directives appropriées, exclut les pages non-indexables (/admin, /api), définit les priorités et les fréquences de mise à jour.",
    category: 'seo',
    tags: ['sitemap', 'robots.txt', 'crawl', 'indexation'],
    tokenImpact: 'neutral',
    tokenEstimate: '+10%',
    difficulty: 'easy',
    config: {
      commands: [
        {
          name: 'gen-sitemap',
          content:
            "# Generate Sitemap\n\nGénère sitemap.xml et robots.txt pour ce projet.\n\nAnalyse les routes et génère:\n- sitemap.xml avec toutes les pages publiques indexables\n- Priorités: homepage=1.0, catégories=0.8, pages=0.6\n- Exclut: /admin, /api, /login, /merci, /panier\n- robots.txt avec Disallow appropriés + lien vers sitemap\n- Pour Symfony: config du bundle Sitemap si disponible",
        },
      ],
    },
    tips: [
      'Soumettez votre sitemap dans Google Search Console',
      'Un sitemap à jour accélère l\'indexation des nouvelles pages',
      'Les pages en noindex ne doivent pas être dans le sitemap',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'seo-core-web-vitals',
    name: 'Core Web Vitals',
    shortDescription: 'Optimise LCP, FID, CLS pour Google',
    description:
      "Analyse et optimise les Core Web Vitals (LCP, INP, CLS) qui sont des signaux de classement Google depuis 2021. Identifie les images sans dimensions, les polices bloquantes, le JS non-différé, le layout shift causé par les pubs/embeds, et propose des corrections concrètes.",
    category: 'seo',
    tags: ['core-web-vitals', 'lcp', 'cls', 'performance', 'google'],
    tokenImpact: 'neutral',
    tokenEstimate: '+20%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Core Web Vitals Optimization\n\nPour chaque page:\n- LCP <2.5s: hero image en loading=eager, preload, WebP/AVIF\n- CLS <0.1: width+height sur TOUTES les images et iframes\n- INP <200ms: éviter les long tasks JS, différer les scripts non-critiques\n- Polices: font-display: swap, preconnect Google Fonts\n- Images: lazy loading sauf above-the-fold, srcset pour responsive\n- Signaler les problèmes CWV détectés dans le code",
    },
    tips: [
      'Le CLS est souvent causé par les images sans dimensions fixed',
      'Google PageSpeed Insights = source de vérité pour les CWV',
      'Le LCP est la métrique la plus impactante pour le classement',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'seo-content-optimizer',
    name: 'Content SEO',
    shortDescription: 'Optimise le contenu pour le référencement',
    description:
      "Analyse la structure sémantique du contenu: hiérarchie des headings (H1>H2>H3), densité de mots-clés, longueur optimale, contenu dupliqué, lisibilité (score Flesch). Propose des améliorations de structure et de formulation pour mieux ranker sur les requêtes cibles.",
    category: 'seo',
    tags: ['contenu', 'headings', 'keywords', 'sémantique'],
    tokenImpact: 'neutral',
    tokenEstimate: '+15%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Content SEO\n\nStructure sémantique:\n- Un seul H1 par page, correspond au sujet principal\n- H2/H3 hiérarchisés logiquement (pas de saut H1→H3)\n- Mot-clé principal dans: H1, premier paragraphe, au moins un H2\n- Texte alt des images: descriptif + mot-clé si pertinent\n- Contenu min 300 mots pour les pages indexables\n- Liens internes vers pages pertinentes\n- Signaler les H1 manquants ou multiples",
    },
    tips: [
      'Un seul H1 par page est une règle absolue',
      'Les balises alt vides hurt le SEO ET l\'accessibilité',
      'Le contenu thin (<300 mots) peut être penalisé par Google',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'seo-og-pro',
    name: 'Open Graph Pro',
    shortDescription: 'Balises OG complètes pour le partage social',
    description:
      "Génère l'ensemble des meta tags Open Graph (Facebook) et Twitter Cards pour un partage social optimal. Optimise les dimensions d'images, gère les variations par type de contenu (article, produit, profil), et inclut les balises spécifiques LinkedIn et WhatsApp.",
    category: 'seo',
    tags: ['open-graph', 'twitter-cards', 'social', 'partage'],
    tokenImpact: 'neutral',
    tokenEstimate: '+10%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Open Graph & Social Meta\n\nPour chaque page:\n- og:title (max 60 chars), og:description (max 155 chars)\n- og:image: 1200x630px minimum, absolu URL, format jpg/png\n- og:type: website/article/product selon le contexte\n- twitter:card: summary_large_image pour un meilleur rendu\n- twitter:site: @handle de l'organisation\n- article:published_time et article:author sur les articles\n- Signaler si og:image manquante ou URL relative",
    },
    tips: [
      'L\'image OG 1200x630px est validée par le Facebook Sharing Debugger',
      'Sans og:image, le partage affiche un aperçu dégradé',
      'WhatsApp lit les og:tags — important pour le partage mobile',
    ],
    isEnabled: false,
    isImported: false,
  },

  // ─── RESPONSIVE ────────────────────────────────────────────────────────────
  {
    id: 'resp-mobile-first',
    name: 'Mobile-First Converter',
    shortDescription: 'Convertit vers une approche mobile-first',
    description:
      "Analyse votre CSS et identifie les patterns desktop-first (media queries max-width) puis les convertit en mobile-first (min-width). Réorganise les styles de base pour le mobile, déplace les overrides aux breakpoints supérieurs. Réduit la complexité CSS et améliore les performances mobiles.",
    category: 'responsive',
    tags: ['mobile-first', 'responsive', 'media-queries', 'css'],
    tokenImpact: 'neutral',
    tokenEstimate: '+20%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Mobile-First Approach\n\nConventions de développement:\n- CSS de base = mobile (pas de media query)\n- Overrides avec min-width pour tablette/desktop\n- Breakpoints Tailwind: sm(640px) md(768px) lg(1024px) xl(1280px)\n- Pas de max-width media queries sauf cas exceptionnels documentés\n- Tester d'abord sur iPhone SE (375px) avant desktop\n- Signaler les styles de base qui cassent sur mobile",
    },
    tips: [
      'Mobile-first = CSS de base pour mobile, min-width pour agrandir',
      'Commencez par le viewport 375px (iPhone SE) = le plus contraint',
      'La conversion desktop→mobile-first réduit souvent le CSS de 20%',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'resp-breakpoint-architect',
    name: 'Breakpoint Architect',
    shortDescription: 'Conçoit un système de breakpoints cohérent',
    description:
      "Analyse les breakpoints existants dans votre projet, détecte les incohérences (valeurs magiques, breakpoints arbitraires, conflits) et propose un système cohérent basé sur le contenu plutôt que les devices. Génère la config Tailwind ou les variables CSS correspondantes.",
    category: 'responsive',
    tags: ['breakpoints', 'responsive', 'tailwind', 'design-system'],
    tokenImpact: 'saves',
    tokenEstimate: '-10%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Breakpoint System\n\nSystème de breakpoints standardisé:\n- Utiliser UNIQUEMENT les breakpoints du design system (tailwind.config)\n- Pas de valeurs magiques (ex: @media(max-width: 843px))\n- sm=640px md=768px lg=1024px xl=1280px 2xl=1536px\n- Composants: s'adapte à son conteneur (container queries si supporté)\n- Signaler les breakpoints non-standards dans le code",
    },
    tips: [
      'Basez les breakpoints sur le contenu, pas les devices exactes',
      'Container Queries (CSS) = l\'avenir, plus flexible que les media queries',
      'Préférez des unités em/rem pour les breakpoints (zoom-friendly)',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'resp-fluid-typography',
    name: 'Fluid Typography',
    shortDescription: 'Typographie fluide entre mobile et desktop',
    description:
      "Implémente une typographie fluide qui s'adapte progressivement entre les breakpoints grâce à clamp(). Calcule les ratios optimaux, génère les tokens de taille de police (text-sm à text-6xl), assure la lisibilité sur tous les écrans sans media queries pour la typo.",
    category: 'responsive',
    tags: ['typographie', 'fluid', 'clamp', 'responsive'],
    tokenImpact: 'neutral',
    tokenEstimate: '+10%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Fluid Typography\n\nTypographie adaptative:\n- Utiliser clamp() pour les tailles de police principales\n- Exemple: clamp(1rem, 2.5vw, 1.5rem) au lieu de media queries\n- Ratio d'échelle modulaire (1.25 = Major Third, 1.333 = Perfect Fourth)\n- line-height fluide: 1.4-1.6 pour le body, 1.1-1.2 pour les headings\n- Minimum: 16px pour le texte body (accessibility)\n- Proposer la config Tailwind correspondante si disponible",
    },
    tips: [
      'clamp() élimine les breakpoints pour la typo — code plus propre',
      "Utilisez l'outil utopia.fyi pour calculer les valeurs clamp()",
      "La taille minimum doit être ≥16px pour l'accessibilité WCAG",
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'resp-grid-master',
    name: 'Grid Master',
    shortDescription: 'Optimise les layouts Grid et Flexbox',
    description:
      "Expert en CSS Grid et Flexbox. Analyse vos layouts et propose les meilleures implémentations: auto-fill vs auto-fit, grid-template-areas pour les layouts complexes, subgrid, aspect-ratio, gap cohérent. Convertit les vieux layouts float/table en CSS moderne.",
    category: 'responsive',
    tags: ['grid', 'flexbox', 'layout', 'css-moderne'],
    tokenImpact: 'neutral',
    tokenEstimate: '+15%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## CSS Grid & Flexbox\n\nBonnes pratiques layout:\n- Grid pour les layouts 2D (grilles de cartes, page layout)\n- Flexbox pour les layouts 1D (nav, boutons en ligne)\n- auto-fill pour les grilles responsives sans breakpoints\n- grid-template-areas pour les layouts complexes (lisibilité++)\n- gap au lieu de margins pour les espacements en grid/flex\n- aspect-ratio pour les médias (évite le CLS)\n- Éviter les heights fixes (utilisez min-height)",
    },
    tips: [
      'grid-auto-fit avec minmax() = grille responsive sans media queries',
      'CSS Subgrid (Chrome 117+) résout l\'alignement entre rows',
      'Pas de position:absolute pour le layout — mauvais signal de design',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'resp-image-responsive',
    name: 'Image Responsive',
    shortDescription: 'Rend les images totalement responsives',
    description:
      "Optimise toutes les images pour le responsive: génère les attributs srcset et sizes pour les images adaptatives, convertit vers formats modernes (WebP/AVIF), ajoute les dimensions width/height (prévention CLS), implémente le lazy loading et les placeholders LQIP.",
    category: 'responsive',
    tags: ['images', 'srcset', 'webp', 'lazy-loading', 'performance'],
    tokenImpact: 'neutral',
    tokenEstimate: '+10%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Responsive Images\n\nStandards images:\n- TOUJOURS width et height sur les <img> (prévient le CLS)\n- srcset pour les images adaptatives: 480w 768w 1280w\n- sizes correspondant aux breakpoints du layout\n- loading='lazy' sauf above-the-fold\n- Format: WebP/AVIF avec fallback jpg/png\n- alt descriptif TOUJOURS (accessibilité + SEO)\n- Signaler les images sans dimensions ou sans alt",
    },
    tips: [
      'Les images sans width/height = cause principale du mauvais CLS',
      "Next.js Image, Nuxt Image, Gatsby Image gèrent tout ça automatiquement",
      'AVIF = meilleure compression mais support moins large que WebP',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'resp-touch-ux',
    name: 'Touch UX Enhancer',
    shortDescription: 'Améliore les interactions tactiles mobile',
    description:
      "Audit et améliore l'expérience utilisateur sur mobile: zones de tap trop petites (min 44x44px), swipe gestures, hover states inutiles sur mobile, inputs mal configurés (type, autocomplete, inputmode), feedback tactile, scroll snap, safe areas (notch/home bar).",
    category: 'responsive',
    tags: ['mobile', 'touch', 'ux', 'tap-targets', 'gestures'],
    tokenImpact: 'neutral',
    tokenEstimate: '+15%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Mobile Touch UX\n\nStandards UX mobile:\n- Tap targets: minimum 44x44px (boutons, liens)\n- Inputs: type approprié (email/tel/number), autocomplete, inputmode\n- Pas d'effets :hover uniquement (invisible sur tactile)\n- Safe areas: env(safe-area-inset-*) pour les encoches/home bars\n- Scroll: overflow-y:scroll avec -webkit-overflow-scrolling:touch\n- Pinch-to-zoom: ne PAS désactiver (accessibility)\n- Touch feedback: active states visibles (<100ms)",
    },
    tips: [
      'Les tap targets trop petits = cause #1 de frustration mobile',
      'type=tel sur les champs téléphone = clavier numérique automatique',
      'Ne désactivez JAMAIS le zoom utilisateur (user-scalable=no)',
    ],
    isEnabled: false,
    isImported: false,
  },

  // ─── CLAUDE MEMORY ─────────────────────────────────────────────────────────
  {
    id: 'mem-memory-writer',
    name: 'Memory Writer',
    shortDescription: 'Écrit des fichiers mémoire structurés',
    description:
      "Identifie automatiquement ce qui mérite d'être mémorisé (préférences utilisateur, décisions techniques, feedbacks, références) et crée les fichiers mémoire correspondants dans ~/.claude/projects/*/memory/ avec le bon format frontmatter. Met à jour MEMORY.md en conséquence.",
    category: 'memory',
    tags: ['mémoire', 'persistance', 'contexte', 'fichiers'],
    tokenImpact: 'saves',
    tokenEstimate: '-20%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Memory Writing\n\nGestion proactive de la mémoire:\n- Quand l'utilisateur corrige une approche: sauvegarder en feedback memory\n- Quand une décision technique importante est prise: project memory\n- Quand des infos sur l'utilisateur sont partagées: user memory\n- Format: frontmatter (name/description/type) + règle + **Why:** + **How to apply:**\n- Mettre à jour MEMORY.md après chaque écriture\n- Ne pas dupliquer: vérifier si mémoire existante à mettre à jour",
    },
    tips: [
      "Dites 'retiens que...' pour déclencher une sauvegarde explicite",
      'Les feedbacks mémorisés évitent de répéter les mêmes corrections',
      'La mémoire user améliore la pertinence des réponses au fil du temps',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'mem-session-saver',
    name: 'Session Saver',
    shortDescription: 'Sauvegarde et restaure les sessions complètes',
    description:
      "Avant chaque /compact ou fin de session, sauvegarde automatiquement l'état complet: fichiers modifiés (liste), tâches en cours, erreurs rencontrées et leurs solutions, plan actif, dernière commande exécutée. Génère un fichier de reprise pour la prochaine session.",
    category: 'memory',
    tags: ['session', 'sauvegarde', 'reprise', 'continuité'],
    tokenImpact: 'saves',
    tokenEstimate: '-30%',
    difficulty: 'medium',
    config: {
      commands: [
        {
          name: 'save-session',
          content:
            "# Save Session\n\nSauvegarde l'état complet de la session courante.\n\nCapture:\n- Fichiers modifiés (liste avec description des changements)\n- Tâches en cours et leur statut\n- Erreurs rencontrées et solutions appliquées\n- Plan actif (prochaines étapes)\n- Dernière commande/build exécuté et son résultat\n\nSauvegarde dans ~/.claude/projects/*/memory/session-{date}.md",
        },
      ],
    },
    tips: [
      'Lancez /save-session avant chaque /compact pour zéro perte',
      'La prochaine session commence avec /load-session {date}',
      'Aussi utile pour reprendre le lendemain après une longue session',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'mem-kb-builder',
    name: 'KB Builder',
    shortDescription: 'Construit des bases de connaissances structurées',
    description:
      "Construit une base de connaissances markdown structurée depuis vos conversations, erreurs résolues et décisions techniques. Organise par domaine (auth, DB, déploiement, etc.), crée un index navigable, et permet une récupération rapide via recherche. Idéal pour les projets long terme.",
    category: 'memory',
    tags: ['knowledge-base', 'documentation', 'markdown', 'recherche'],
    tokenImpact: 'saves',
    tokenEstimate: '-15%',
    difficulty: 'advanced',
    config: {
      commands: [
        {
          name: 'kb-add',
          content:
            "# Knowledge Base Add\n\nAjoute une entrée à la base de connaissances du projet.\n\nFormat automatique:\n- Titre: problème ou sujet\n- Contexte: quand ça se produit\n- Solution: étapes précises\n- Code: exemples si pertinent\n- Tags: pour la recherche\n\nIndex mis à jour automatiquement.",
        },
      ],
    },
    tips: [
      'Chaque erreur résolue = une entrée KB pour ne plus la rencontrer',
      "La KB est dans ~/.claude/projects/*/memory/kb/ par défaut",
      "Pour Creebs: support.creebs.fr utilise ce pattern pour la KB CurePress",
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'mem-project-tracker',
    name: 'Project Tracker',
    shortDescription: 'Suit l\'état et les décisions du projet',
    description:
      "Maintient un fichier projet.md à jour avec l'état actuel du projet: fonctionnalités complétées, en cours, à faire, décisions d'architecture et leurs raisons, contraintes identifiées, prochaines étapes. Ce fichier est chargé automatiquement dans les nouvelles sessions.",
    category: 'memory',
    tags: ['projet', 'tracking', 'état', 'décisions'],
    tokenImpact: 'saves',
    tokenEstimate: '-25%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Project State Tracking\n\nMaintien du projet.md:\n- Après chaque feature complétée: mettre à jour le statut\n- Après chaque décision d'architecture: documenter le WHY\n- Chaque session: charger projet.md pour l'état actuel\n- Format: ## Status (🟢 live / 🟡 en cours / 🔴 bloqué)\n- Garder les décisions même si elles semblent évidentes\n- Les contraintes (deadlines, légal, perfs) sont particulièrement importantes",
    },
    tips: [
      'Citez /project au début de chaque session pour recadrer Claude',
      'Les décisions documentées évitent de re-débattre les mêmes points',
      'Le tracker est en mémoire — pas dans le repo (données temporelles)',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'mem-conv-compressor',
    name: 'Conv Compressor',
    shortDescription: 'Compresse les conversations longues',
    description:
      "Compresse les conversations longues en résumés structurés qui préservent l'information essentielle. Identifie et retient: décisions prises, code écrit, erreurs résolues, état des tâches, context du projet. Réduit 50k tokens de conversation en 1-2k tokens de résumé actionnable.",
    category: 'memory',
    tags: ['compression', 'résumé', 'tokens', 'conversation'],
    tokenImpact: 'saves',
    tokenEstimate: '-60%',
    difficulty: 'easy',
    config: {
      commands: [
        {
          name: 'compress-conv',
          content:
            "# Compress Conversation\n\nCompresse la conversation en résumé structuré.\n\nConserve:\n- Décisions techniques et leurs raisons\n- Code important écrit ou modifié\n- Erreurs rencontrées et solutions\n- État des tâches en cours\n- Instructions utilisateur critiques\n\nSupprime: explorations infructueuses, détails de débogage résolus, messages de politesse.",
        },
      ],
    },
    tips: [
      'Lancez après chaque grosse session avant /compact',
      'Le résumé est ~50x plus court mais préserve 90% de la valeur',
      'Sauvegardez les résumés dans ~/.claude/projects/*/memory/conversations.md',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'mem-context-builder',
    name: 'Context Builder',
    shortDescription: 'Construit le contexte optimal pour une nouvelle session',
    description:
      "Charge et assemble le contexte optimal pour démarrer une nouvelle session: fichiers mémoire pertinents, état du projet, dernière session sauvegardée, CLAUDE.md. Ordonne l'information du plus permanent (instructions) au plus récent (dernière session) pour maximiser l'utilité avec un minimum de tokens.",
    category: 'memory',
    tags: ['context', 'onboarding', 'session', 'efficacité'],
    tokenImpact: 'saves',
    tokenEstimate: '-20%',
    difficulty: 'easy',
    config: {
      commands: [
        {
          name: 'load-context',
          content:
            "# Load Context\n\nCharge le contexte optimal pour reprendre le projet.\n\nAssemble dans l'ordre:\n1. Instructions globales (CLAUDE.md)\n2. Profil utilisateur (memory/user.md)\n3. État projet (memory/project.md)\n4. Feedbacks importants (memory/feedback.md)\n5. Dernière session (memory/session-{recent}.md)\n\nRésumé en 1 paragraphe de l'état actuel.",
        },
      ],
    },
    tips: [
      'Commencez chaque session avec /load-context pour une reprise rapide',
      'Sans context builder, Claude repart de zéro — coûteux en explications',
      'Fonctionne mieux quand Memory Writer et Project Tracker sont actifs',
    ],
    isEnabled: false,
    isImported: false,
  },

  // ─── TOKEN SAVINGS ─────────────────────────────────────────────────────────
  {
    id: 'tok-prompt-compressor',
    name: 'Prompt Compressor',
    shortDescription: 'Réduit les prompts sans perte de sens',
    description:
      "Analyse vos prompts et les compresse intelligemment: supprime les formulations verbeux, remplace les explications par des exemples concis, élimine les répétitions, précise le format de sortie. Un prompt de 500 tokens peut souvent être réduit à 150-200 tokens avec les mêmes résultats.",
    category: 'tokens',
    tags: ['tokens', 'prompt', 'optimisation', 'économie'],
    tokenImpact: 'saves',
    tokenEstimate: '-40%',
    difficulty: 'easy',
    config: {
      claudeMd:
        "## Prompt Efficiency\n\nRègle de concision:\n- Réponses courtes et directes sauf demande explicite de détail\n- Pas de preamble ('Je vais vous expliquer...', 'Certainement!')\n- Pas de récapitulatif en fin de réponse sauf si demandé\n- Format code préféré aux explications longues\n- Une décision directe plutôt que 3 options si la meilleure est claire\n- Questionner si le contexte fourni est insuffisant avant de supposer",
    },
    tips: [
      'Les preambles inutiles = tokens gaspillés × 100 conversations',
      "Format: /optimize-prompt 'votre prompt ici' pour un retour instantané",
      'Les instructions dans CLAUDE.md valent mieux que de les répéter',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'tok-cache-optimizer',
    name: 'Cache Optimizer',
    shortDescription: 'Implémente le prompt caching Anthropic',
    description:
      "Configure et optimise le prompt caching de l'API Anthropic (cache_control: ephemeral). Identifie les parties statiques de vos prompts (instructions, contexte projet, documents de référence) et les structure pour maximiser les cache hits. Peut réduire les coûts de 70-90% sur les usages répétitifs.",
    category: 'tokens',
    tags: ['cache', 'api', 'anthropic', 'économie'],
    tokenImpact: 'saves',
    tokenEstimate: '-75%',
    difficulty: 'advanced',
    config: {
      commands: [
        {
          name: 'setup-cache',
          content:
            "# Setup Prompt Caching\n\nConfigure le prompt caching Anthropic pour ce projet.\n\nAnalyse:\n- Parties statiques des prompts (instructions, docs, contexte)\n- Parties dynamiques (input utilisateur, variables)\n\nGénère:\n- Code avec cache_control: {type: 'ephemeral'} aux bons endroits\n- Estimation du taux de cache hit attendu\n- Économie estimée en tokens et coût",
        },
      ],
    },
    tips: [
      'Le cache Anthropic dure 5 minutes — planifiez vos requêtes',
      'Les prompts système statiques sont les meilleurs candidats au cache',
      'Le cache réduit aussi la latence (cache hit = plus rapide)',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'tok-rag-builder',
    name: 'RAG Builder',
    shortDescription: 'Construit des systèmes RAG pour les grands contextes',
    description:
      "Conçoit et implémente des systèmes de Retrieval-Augmented Generation pour éviter d'envoyer des documents entiers à l'API. Chunk, indexe et recherche seulement les passages pertinents. Compatible avec pgvector, Chroma, Pinecone. Réduit les tokens de contexte de 80-95%.",
    category: 'tokens',
    tags: ['rag', 'vectordb', 'embeddings', 'recherche'],
    tokenImpact: 'saves',
    tokenEstimate: '-85%',
    difficulty: 'advanced',
    config: {
      commands: [
        {
          name: 'build-rag',
          content:
            "# Build RAG System\n\nConçoit un système RAG pour ce projet.\n\nPlan:\n1. Stratégie de chunking (taille, overlap)\n2. Choix vectorDB (pgvector/Chroma/Pinecone selon l'infra)\n3. Modèle d'embedding (text-embedding-3-small recommandé)\n4. Pipeline de retrieval (top-k, reranking)\n5. Intégration avec l'API Claude\n\nÉconomie estimée: -80 à -95% de tokens de contexte",
        },
      ],
    },
    tips: [
      'pgvector sur PostgreSQL = option la plus simple si vous avez déjà Postgres',
      'chunk_size=512 tokens avec overlap=64 = bon défaut pour docs techniques',
      'Le RAG est essentiel pour les codebases >100k tokens',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'tok-batch-processor',
    name: 'Batch Processor',
    shortDescription: 'Traite les requêtes en batch pour -50% de coût',
    description:
      "Configure l'API Batch d'Anthropic (claude-3-haiku-20240307 en batch) pour les tâches qui n'ont pas besoin d'une réponse immédiate. Réduit les coûts de 50% sur les analyses de code, les générations de tests, les reviews batch. Idéal pour les pipelines CI/CD.",
    category: 'tokens',
    tags: ['batch', 'api', 'ci-cd', 'économie'],
    tokenImpact: 'saves',
    tokenEstimate: '-50%',
    difficulty: 'advanced',
    config: {
      commands: [
        {
          name: 'setup-batch',
          content:
            "# Setup Batch Processing\n\nConfigure l'API Batch Anthropic pour les tâches en arrière-plan.\n\nGénère:\n- Client batch avec gestion des résultats\n- Queue de tâches avec retry\n- Monitoring du statut des batches\n- Parsing des résultats\n\nUse cases: review automatique, génération de tests, analyse de code en CI",
        },
      ],
    },
    tips: [
      "L'API Batch = même modèle, -50% de prix, latence ~1h",
      'Parfait pour les reviews de code en CI (pas besoin de résultat immédiat)',
      'Haiku en batch = option ultra-économique pour les tâches simples',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'tok-context-manager',
    name: 'Context Manager',
    shortDescription: 'Gère intelligemment la fenêtre de contexte',
    description:
      "Surveille et optimise l'utilisation de la fenêtre de contexte: supprime les fichiers entiers une fois analysés (garde juste les extraits pertinents), résume les longues conversations, évite de re-lire les fichiers déjà en contexte, priorise l'information récente.",
    category: 'tokens',
    tags: ['context', 'fenêtre', 'gestion', 'optimisation'],
    tokenImpact: 'saves',
    tokenEstimate: '-30%',
    difficulty: 'medium',
    config: {
      claudeMd:
        "## Context Window Management\n\nGestion efficace du contexte:\n- Ne pas re-lire un fichier déjà en contexte (mémoriser ce qui a été lu)\n- Résumer les longues discussions quand elles sont résolues\n- Garder uniquement les extraits pertinents, pas les fichiers entiers\n- Prioriser: tâche courante > contexte récent > contexte ancien\n- Signaler proactivement quand le contexte approche 80% de saturation\n- Proposer /compact quand le contexte est > 70k tokens",
    },
    tips: [
      "Dites 'résume notre échange' pour nettoyer sans perdre d'info",
      'Claude Code /compact est puissant mais imprévisible — préférez /smart-compact',
      'Le context manager réduit les coupures inattendues de session',
    ],
    isEnabled: false,
    isImported: false,
  },
  {
    id: 'tok-finetune-advisor',
    name: 'Fine-Tune Advisor',
    shortDescription: 'Conseille sur le fine-tuning et les alternatives',
    description:
      "Évalue si votre cas d'usage bénéficierait d'un fine-tuning (modèles Anthropic, GPT-4o mini) par rapport aux alternatives moins coûteuses (few-shot, prompt engineering, RAG). Calcule le ROI, estime les volumes nécessaires, et si le fine-tuning est recommandé, génère le dataset de training.",
    category: 'tokens',
    tags: ['fine-tuning', 'training', 'optimisation', 'coût'],
    tokenImpact: 'saves',
    tokenEstimate: '-70%',
    difficulty: 'advanced',
    config: {
      commands: [
        {
          name: 'finetune-analysis',
          content:
            "# Fine-Tune Analysis\n\nÉvalue si le fine-tuning est adapté à ce use case.\n\nAnalyse:\n- Volume de requêtes (seuil: >10k/mois pour rentabiliser)\n- Cohérence du format de sortie attendu\n- Disponibilité de données d'entraînement\n- Alternatives: few-shot / RAG / prompt engineering\n\nRecommandation: fine-tune OU alternative + coût estimé",
        },
      ],
    },
    tips: [
      "Le fine-tuning est rarement nécessaire avant 10k requêtes/mois",
      'Essayez few-shot (5-10 exemples) avant de considérer le fine-tuning',
      "Un bon prompt engineering résout 80% des cas de fine-tuning",
    ],
    isEnabled: false,
    isImported: false,
  },
]
