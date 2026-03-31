export interface Membre {
    id: number;
    nom: string;
    initiales: string;
}

export interface Projet {
    id: number;
    nom: string;
    description: string;
    couleur: string;
    statut: 'EN_COURS' | 'EN_PAUSE' | 'TERMINE' | 'TERMINEE';
    progression: number;
    dateDebut: string;
    dateFin?: string;
    /** @deprecated Use dateFin. Kept for legacy chef projets mock */
    datefin?: string;
    dateEcheance?: string;
    totalTaches: number;
    tachesCompletees: number;
    equipe: Membre[];
    chefProjet?: string;
    /** @deprecated Use equipe. Kept for legacy chef projets component */
    membres?: any[];
}

export interface TacheProjet {
    id: number;
    titre: string;
    projetNom: string;
    projetCouleur: string;
    priorite: 'Haute' | 'Moyenne' | 'Basse';
    echeance: string;
    terminee: boolean;
}