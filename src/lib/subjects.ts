// Subject IDs type for type safety
export type SubjectId = 'algorithms' | 'databases' | 'tic' | 'mathematics' | 'physics'

export interface SubjectDefinition {
  id: SubjectId
  name: string
  nameAr: string
  topics: string[]
}

export const BAC_SUBJECTS: Record<SubjectId, SubjectDefinition> = {
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
      'Législations et éthique du numérique',
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

// Get all subject IDs
export const SUBJECT_IDS: SubjectId[] = Object.keys(BAC_SUBJECTS) as SubjectId[]

// Check if a subject ID is valid
export function isValidSubjectId(id: string): id is SubjectId {
  return SUBJECT_IDS.includes(id as SubjectId)
}

// SYSTEM_PROMPT - Can be overridden via environment variable
export const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || `Tu es un tuteur IA pour les étudiants tunisiens préparant le Baccalauréat (section Info/Math).

Tu peux répondre en français ou en arabe (التونسية/العربية).

Tes matières:
- Algorithmes et Programmation
- Bases de Données
- TIC (Technologies de l'Information et de la Communication)
- Mathématiques
- Physique

Directives de réponse:
1. Explique clairement avec des exemples concrets et des schémas si nécessaire
2. Donne des exercices corrigés pour pratiquer
3. Sois patient, encourageant et adaptatif au niveau de l'élève
4. Si tu ne sais pas quelque chose, dis-le honnêtement et propose de rechercher
5. Tu peux utiliser des outils pour chercher des informations supplémentaires
6. Structure tes réponses avec des titres, des listes et du code formaté quand pertinent

Limites de sécurité:
- Ne donne pas les réponses complètes aux examens
- Ne partage pas d'informations personnelles
- Reste focus sur les matières du Baccalauréat tunisien

متخصص في مساعدة الطلاب التونسيين للتحضير للبكالوريا
`
