/**
 * Interfaces pour le Profil Employé
 */

export interface ProfilEmploye {
    id: string; // Keycloak ID
    nom: string;
    prenom: string;
    nomComplet: string; // Computed
    photo: string;
    email: string;
    telephone: string;

    // Informations professionnelles
    poste: string;
    departement: string;
    dateEmbauche: string;
    anciennete: string; // Computed "2 ans 3 mois"

    // Informations personnelles
    dateNaissance: string;
    lieuNaissance: string;
    adresse: string;
    ville: string;
    codePostal: string;

    // Statistiques
    congesRestants: number;
    congesPris: number;
    congesTotal: number;
    tachesCompletes: number;
    tachesEnCours: number;
    tauxPresence: number; // Pourcentage
    objectifsAtteints: number; // Pourcentage
    formationsSuivies: number;
    formationsTotal: number;
}

export interface DocumentEmploye {
    id: number;
    employeId: string;
    nom: string;
    type: 'pdf' | 'excel' | 'word' | 'image';
    categorie: 'personnel' | 'contractuel' | 'administratif' | 'formation';
    taille: string; // "245 KB"
    tailleBytes: number;
    dateAjout: string;
    dateModification?: string;
    url?: string;
    description?: string;
}

export interface ActiviteEmploye {
    id: number;
    employeId: string;
    titre: string;
    description: string;
    date: string;
    type: 'demande' | 'tache' | 'formation' | 'document' | 'conge' | 'presence';
    statut?: 'validee' | 'refusee' | 'en_attente' | 'terminee' | 'en_cours';
    badge?: string;
    icone?: string;
    lien?: string;
}

export interface StatistiquesEmploye {
    tauxPresence: number;
    objectifsAtteints: number;
    formationsSuivies: number;
    formationsTotal: number;
    tachesCompletes: number;
    tachesTotal: number;
    congesRestants: number;
    congesTotal: number;
}

export interface ProfilComplet {
    profil: ProfilEmploye;
    documents: DocumentEmploye[];
    activites: ActiviteEmploye[];
    statistiques: StatistiquesEmploye;
}

// DTO pour les mises à jour
export interface UpdateProfilDTO {
    email?: string;
    telephone?: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
}

// Solde de congés
export interface SoldeConge {
    annuel: number;
    maladie: number;
    rtt: number;
    pris: number;
}

// Demande de congé
export interface DemandeConge {
    id: number;
    employeId: string;
    type: 'ANNUEL' | 'MALADIE' | 'RTT' | 'SANS_SOLDE';
    dateDebut: string;
    dateFin: string;
    jours: number;
    statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
    motif?: string;
    dateDemande: string;
    dateReponse?: string;
    commentaire?: string;
}