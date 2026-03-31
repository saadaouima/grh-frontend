import { Projet } from 'src/app/gerai/models/projet.model';
import { Tache } from 'src/app/gerai/models/tache.model';
import { Employe } from 'src/app/gerai/models/employe.model';

export const MOCK_EMPLOYES: Employe[] = [
    { id: 1, nom: 'Ben Ali', prenom: 'Sami', email: 's.benali@gerai.tn', poste: 'Développeur', departement: 'Informatique' },
    { id: 2, nom: 'Trabelsi', prenom: 'Ines', email: 'i.trabelsi@gerai.tn', poste: 'Designer', departement: 'Design' },
    { id: 3, nom: 'Gharbi', prenom: 'Mohamed', email: 'm.gharbi@gerai.tn', poste: 'Analyste', departement: 'Informatique' },
    { id: 4, nom: 'Sassi', prenom: 'Leila', email: 'l.sassi@gerai.tn', poste: 'Testeur', departement: 'Qualité' },
    { id: 5, nom: 'Hammami', prenom: 'Youssef', email: 'y.hammami@gerai.tn', poste: 'DevOps', departement: 'Informatique' }
];

export const MOCK_PROJETS: Projet[] = [
    {
        id: 1,
        nom: 'Refonte Système RH',
        description: 'Migration complète du système RH.',
        couleur: '#6366f1',
        dateDebut: '2025-01-15',
        dateFin: '2025-06-30',
        statut: 'EN_COURS',
        progression: 65,
        totalTaches: 20,
        tachesCompletees: 13,
        equipe: [
            { id: 1, nom: 'Sami Ben Ali', initiales: 'SB' },
            { id: 2, nom: 'Ines Trabelsi', initiales: 'IT' },
            { id: 3, nom: 'Mohamed Gharbi', initiales: 'MG' }
        ]
    },
    {
        id: 2,
        nom: 'Application Mobile Employés',
        description: 'App mobile de gestion RH.',
        couleur: '#f59e0b',
        dateDebut: '2025-02-01',
        dateFin: '2025-08-31',
        statut: 'EN_COURS',
        progression: 40,
        totalTaches: 15,
        tachesCompletees: 6,
        equipe: [
            { id: 1, nom: 'Sami Ben Ali', initiales: 'SB' },
            { id: 4, nom: 'Leila Sassi', initiales: 'LS' }
        ]
    }
];

// On utilise 'let' pour pouvoir ajouter/supprimer des tâches en mémoire
export let MOCK_TACHES: Tache[] = [
    { id: 1, titre: 'Analyse des besoins', projet: 'Refonte Système RH', priorite: 'Haute', prioriteColor: '#ff5370', echeance: '2025-01-31', assigneA: 'Mohamed Gharbi' },
    { id: 2, titre: 'Conception UX/UI', projet: 'Refonte Système RH', priorite: 'Haute', prioriteColor: '#ff5370', echeance: '2025-02-28', assigneA: 'Ines Trabelsi' }
];

// Fonction utilitaire pour mettre à jour les tâches (simule le DELETE/POST)
export const updateTachesList = (newList: Tache[]) => {
    MOCK_TACHES = newList;
};