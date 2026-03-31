import {
    ProfilEmploye,
    DocumentEmploye,
    ActiviteEmploye,
    StatistiquesEmploye
} from 'src/app/gerai/models/employe-profile.model';

/* ══════════════════════════════════════════════════════════════
   📊 DONNÉES MOCK - Profil Employé
   Note : Les champs nom, prenom et email sont laissés vides car 
   ils seront injectés par KeycloakService dans le ProfilEmployeService.
   ══════════════════════════════════════════════════════════════ */

// Helper pour calculer l'ancienneté
const calculerAnciennete = (dateEmbauche: string): string => {
    const embauche = new Date(dateEmbauche);
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - embauche.getTime();
    const mois = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    const annees = Math.floor(mois / 12);
    const moisRestants = mois % 12;

    if (annees === 0) return `${mois} mois`;
    if (moisRestants === 0) return `${annees} an${annees > 1 ? 's' : ''}`;
    return `${annees} an${annees > 1 ? 's' : ''} ${moisRestants} mois`;
};

/* ──────────────────────────────────────────────────────────
   👤 PROFIL EMPLOYÉ (Structure prête pour Keycloak)
   ────────────────────────────────────────────────────────── */

export let profil: ProfilEmploye = {
    id: '', // Sera remplacé par l'ID Keycloak (sub)
    nom: '', // Sera remplacé par Keycloak
    prenom: '', // Sera remplacé par Keycloak
    nomComplet: '', // Sera calculé par Keycloak
    photo: 'assets/images/user/avatar-1.jpg',
    email: '', // Sera remplacé par Keycloak
    telephone: '+216 98 765 432',
    poste: 'Développeur Frontend',
    departement: 'IT - Développement',
    dateEmbauche: '2022-03-15',
    anciennete: calculerAnciennete('2022-03-15'),
    dateNaissance: '1994-08-20',
    lieuNaissance: 'Tunis',
    adresse: '45 Avenue de la République',
    ville: 'Tunis',
    codePostal: '1002',
    congesRestants: 18,
    congesPris: 7,
    congesTotal: 25,
    tachesCompletes: 42,
    tachesEnCours: 5,
    tauxPresence: 96,
    objectifsAtteints: 85,
    formationsSuivies: 4,
    formationsTotal: 5
};

/* ──────────────────────────────────────────────────────────
   📄 DOCUMENTS
   ────────────────────────────────────────────────────────── */

export let documents: DocumentEmploye[] = [
    {
        id: 1,
        employeId: 'kc-user-id',
        nom: 'CV_Professionnel.pdf',
        type: 'pdf',
        categorie: 'personnel',
        taille: '245 KB',
        tailleBytes: 251_904,
        dateAjout: new Date('2024-01-15').toISOString()
    },
    {
        id: 2,
        employeId: 'kc-user-id',
        nom: 'Contrat_Travail_Signe.pdf',
        type: 'pdf',
        categorie: 'contractuel',
        taille: '1.2 MB',
        tailleBytes: 1_258_291,
        dateAjout: new Date('2022-03-15').toISOString()
    }
];

export let nextDocId = 3;

/* ──────────────────────────────────────────────────────────
   📅 ACTIVITÉS RÉCENTES
   ────────────────────────────────────────────────────────── */

export let activites: ActiviteEmploye[] = [
    {
        id: 1,
        employeId: 'kc-user-id',
        titre: 'Connexion sécurisée',
        description: 'Authentification réussie via Keycloak GerAI',
        date: new Date().toISOString(),
        type: 'presence',
        statut: 'validee',
        badge: 'Session Active',
        icone: 'ti ti-shield-check'
    }
];

/* ══════════════════════════════════════════════════════════════
   🔧 FONCTIONS UTILITAIRES
   ══════════════════════════════════════════════════════════════ */

export function getProfil(): ProfilEmploye {
    return { ...profil };
}

export function getDocuments(): DocumentEmploye[] {
    return [...documents];
}

export function getActivites(): ActiviteEmploye[] {
    return [...activites].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getStatistiques(): StatistiquesEmploye {
    return {
        tauxPresence: profil.tauxPresence,
        objectifsAtteints: profil.objectifsAtteints,
        formationsSuivies: profil.formationsSuivies,
        formationsTotal: profil.formationsTotal,
        tachesCompletes: profil.tachesCompletes,
        tachesTotal: profil.tachesCompletes + profil.tachesEnCours,
        congesRestants: profil.congesRestants,
        congesTotal: profil.congesTotal
    };
}

export function updateProfil(updates: Partial<ProfilEmploye>): ProfilEmploye {
    profil = { ...profil, ...updates };
    console.log('[MOCK] ✅ Profil mis à jour localement');
    return { ...profil };
}

export function ajouterDocument(doc: Omit<DocumentEmploye, 'id'>): DocumentEmploye {
    const newDoc: DocumentEmploye = {
        ...doc,
        id: nextDocId++,
        dateAjout: new Date().toISOString()
    };
    documents.push(newDoc);
    return newDoc;
}

export function supprimerDocument(id: number): boolean {
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) return false;
    documents.splice(index, 1);
    return true;
}

export function getDebugState() {
    return {
        profil_id: profil.id,
        docs_count: documents.length,
        statistiques: getStatistiques()
    };
}