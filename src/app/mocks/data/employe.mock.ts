import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { StatistiquesEmploye } from 'src/app/theme/shared/interfaces/statistiques-employe';

export let MOCK_EMPLOYES: Employe[] = [
    {
        id: 1,
        nom: 'Ben Ali',
        prenom: 'Sami',
        email: 'sami.benali@gerai.tn',
        telephone: '+216 71 000 001',
        dateEmbauche: '2021-03-15',
        poste: 'Développeur Backend',
        departement: 'Informatique',
        chefId: 1
    },
    {
        id: 2,
        nom: 'Trabelsi',
        prenom: 'Ines',
        email: 'ines.trabelsi@gerai.tn',
        telephone: '+216 71 000 002',
        dateEmbauche: '2020-07-01',
        poste: 'Analyste BI',
        departement: 'Data',
        chefId: 1
    },
    {
        id: 3,
        nom: 'Karray',
        prenom: 'Youssef',
        email: 'youssef.karray@gerai.tn',
        telephone: '+216 71 000 003',
        dateEmbauche: '2019-11-20',
        poste: 'Chef de projet',
        departement: 'Management',
        chefId: 1
    },
    {
        id: 4,
        nom: 'Gharbi',
        prenom: 'Mohamed',
        email: 'mohamed.gharbi@gerai.tn',
        telephone: '+216 71 000 004',
        dateEmbauche: '2022-01-10',
        poste: 'Développeur Frontend',
        departement: 'Informatique',
        chefId: 2
    },
    {
        id: 5,
        nom: 'Sassi',
        prenom: 'Leila',
        email: 'leila.sassi@gerai.tn',
        telephone: '+216 71 000 005',
        dateEmbauche: '2021-09-01',
        poste: 'Designer UI/UX',
        departement: 'Design',
        chefId: 2
    },
    {
        id: 6,
        nom: 'Hammami',
        prenom: 'Youssef',
        email: 'youssef.hammami@gerai.tn',
        telephone: '+216 71 000 006',
        dateEmbauche: '2020-03-15',
        poste: 'DevOps Engineer',
        departement: 'Informatique',
        chefId: 1
    },
    {
        id: 7,
        nom: 'Mejri',
        prenom: 'Rania',
        email: 'rania.mejri@gerai.tn',
        telephone: '+216 71 000 007',
        dateEmbauche: '2023-02-01',
        poste: 'QA Engineer',
        departement: 'Qualité',
        chefId: 2
    }
];

let nextId = MOCK_EMPLOYES.length + 1;
export const getNextEmployeId = () => nextId++;

export const MOCK_STATISTIQUES: Record<number, StatistiquesEmploye> = {
    1: { congesRestants: 18, demandesEnCours: 1, tachesActives: 4, tauxPresence: 96 },
    2: { congesRestants: 12, demandesEnCours: 2, tachesActives: 3, tauxPresence: 88 },
    3: { congesRestants: 20, demandesEnCours: 0, tachesActives: 6, tauxPresence: 99 },
    4: { congesRestants: 15, demandesEnCours: 1, tachesActives: 5, tauxPresence: 94 },
    5: { congesRestants: 10, demandesEnCours: 3, tachesActives: 2, tauxPresence: 82 },
    6: { congesRestants: 22, demandesEnCours: 0, tachesActives: 7, tauxPresence: 98 },
    7: { congesRestants: 14, demandesEnCours: 1, tachesActives: 3, tauxPresence: 91 }
};

export const DEFAULT_STATS: StatistiquesEmploye = {
    congesRestants: 15,
    demandesEnCours: 1,
    tachesActives: 3,
    tauxPresence: 95
};
