export const BAC_SUBJECTS = {
  algorithms: {
    id: 'algorithms',
    name: 'Algorithmes et Programmation',
    nameAr: 'الخوارزميات والبرمجة',
    topics: [
      'Variables et types de données',
      'Structures conditionnelles (Si...Alors)',
      'Structures itératives (Pour, TantQue)',
      'Tableaux et matrices',
      'Fonctions et procédures',
      'Récursivité',
      'Tri et recherche',
      'Complexité des algorithmes',
    ],
  },
  databases: {
    id: 'databases',
    name: 'Bases de Données',
    nameAr: 'قواعد البيانات',
    topics: [
      'Modèle entité-association',
      'Modèle relationnel',
      'Algèbre relationnelle',
      'SQL (SELECT, INSERT, UPDATE, DELETE)',
      'Normalisation',
      'Conception de bases de données',
    ],
  },
  tic: {
    id: 'tic',
    name: 'Technologies de l\'Information et Communication',
    nameAr: 'تقنيات المعلومات والاتصال',
    topics: [
      'Réseaux informatiques',
      'Internet et Web',
      'Sécurité informatique',
      'Legislations et éthique du numérique',
      'Algorithmique appliquée aux TIC',
    ],
  },
  mathematics: {
    id: 'mathematics',
    name: 'Mathématiques',
    nameAr: 'الرياضيات',
    topics: [
      'Nombres complexes',
      'Matrices et systèmes linéaires',
      'Suites numériques',
      'Fonctions réelles',
      'Intégration',
      'Dénombrement et probabilités',
      'Statistiques',
    ],
  },
  physics: {
    id: 'physics',
    name: 'Physique',
    nameAr: 'الفيزياء',
    topics: [
      'Mécanique (cinématique, dynamique)',
      'Électricité et électronique',
      'Optique',
      'Thermodynamique',
      'Physique atomique',
      'Électromagnétisme',
    ],
  },
}

export const SYSTEM_PROMPT = `Tu es un tuteur IA pour les étudiants tunisiens préparant le Baccalauréat (section Info/Math).

Tu peux répondre en français ou en arabe (التونسية/العربية).

Tes matières:
- Algorithmes et Programmation
- Bases de Données
- TIC (Technologies de l'Information et Communication)
- Mathématiques
- Physique

Règles:
1. Explique clairement avec des exemples concrets
2. Utilise des schémas si nécessaire (tu peux dessiner avec du texte)
3. Donne des exercices corrigés
4. Sois patient et encourageant
5. Si tu ne sais pas quelque chose, dis-le honnêtement
6. Tu peux utiliser des outils pour chercher des informations supplémentaires

متخصص في مساعدة الطلاب التونسيين للتحضير للبكالوريا
`
