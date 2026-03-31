/**
 * Interfaces pour la gestion des demandes
 * Utilisées par les interfaces Chef ET Employé
 */

export type TypeDemande = 'CONGE' | 'FORMATION' | 'DOCUMENT_ADMINISTRATIF' | 'PRET' | 'AUTRE' | 'ANNUEL' | 'MALADIE' | 'RTT' | 'SANS_SOLDE';
export type StatutDemande = 'EN_ATTENTE' | 'VALIDEE_CHEF' | 'VALIDEE_RH' | 'REJETEE' | 'VALIDEE';

export interface Demande {
  id: number;
  employeId: string;
  employeNom: string;
  employePrenom: string;
  employeInitiales: string;
  employePhoto?: string;

  // Type de demande
  type: TypeDemande;
  typeLabel?: string;
  typeIcon?: string;
  typeColor?: string;

  // Description
  description: string;

  // Dates (On garde 'date' en optionnel pour la compatibilité avec ton Dashboard)
  dateCreation: string;
  dateDebut: string | null;
  dateFin: string | null;
  date?: string;           // Ajouté pour corriger l'erreur template HTML
  joursOuvres?: number;

  // Statut
  statut: StatutDemande | string;
  statutLabel?: string;
  statutIcon?: string;
  statutColor?: string;    // Renommé pour cohérence (était statusColor)

  // Propriétés UI pour le Dashboard (Points de couleur et icônes)
  bgColor?: string;        // Ajouté pour corriger l'erreur template HTML
  icon?: string;           // Ajouté pour corriger l'erreur template HTML

  // Validation
  validePar?: string | null;
  validateurNom?: string | null;
  dateValidation?: string | null;
  commentaireChef: string | null;
  commentaireRh: string | null;

  // Pièces jointes
  pieceJointes?: string[];
}

// --- Les autres interfaces restent identiques ---

export interface StatistiquesDemandes {
  total: number;
  enAttente: number;
  validees: number;
  rejetees: number;
  parType: {
    [key in TypeDemande]?: number; // Optionnel car tous les types ne sont pas forcément présents
  };
}

export interface CreateDemandeDTO {
  type: TypeDemande;
  description: string;
  dateDebut: string | null;
  dateFin: string | null;
  pieceJointes?: string[];
}

export interface DemandesEmployeComplet {
  demandes: Demande[];
  statistiques: StatistiquesDemandes;
}

export interface TypeDemandeConfig {
  type: TypeDemande;
  label: string;
  icon: string;
  color: string;
  requiresDates: boolean;
}

export const TYPES_DEMANDE_CONFIG: TypeDemandeConfig[] = [
  { type: 'CONGE', label: 'Congé', icon: 'ti ti-beach', color: '#3B82F6', requiresDates: true },
  { type: 'FORMATION', label: 'Formation', icon: 'ti ti-school', color: '#10B981', requiresDates: true },
  { type: 'DOCUMENT_ADMINISTRATIF', label: 'Document administratif', icon: 'ti ti-file-text', color: '#8B5CF6', requiresDates: false },
  { type: 'PRET', label: 'Prêt', icon: 'ti ti-coin', color: '#F59E0B', requiresDates: false },
  { type: 'AUTRE', label: 'Autre', icon: 'ti ti-dots', color: '#64748B', requiresDates: false }
];