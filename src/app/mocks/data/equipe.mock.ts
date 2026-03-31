import { MembreEquipe } from 'src/app/gerai/models/equipe.models';

export let MOCK_MEMBRES: MembreEquipe[] = [
    {
        id: 1,
        nom: 'Ben Ali',
        prenom: 'Sami',
        poste: 'Développeur Backend',
        email: 'sami.benali@gerai.tn',
        statut: 'ACTIF',
        telephone: '+216 71 000 001',
        dateEmbauche: '2021-03-15',
        departement: 'Informatique',
        manager: 'Stéphane Manager',
        competences: ['Java', 'Spring Boot', 'PostgreSQL'],
        keycloakId: crypto.randomUUID(),
        present: true
    },
    {
        id: 2,
        nom: 'Trabelsi',
        prenom: 'Ines',
        poste: 'Analyste BI',
        email: 'ines.trabelsi@gerai.tn',
        statut: 'CONGE',
        telephone: '+216 71 000 002',
        dateEmbauche: '2020-07-01',
        departement: 'Data',
        manager: 'Stéphane Manager',
        competences: ['Power BI', 'SQL', 'Python'],
        keycloakId: crypto.randomUUID(),
        present: true
    },
    {
        id: 3,
        nom: 'Karray',
        prenom: 'Youssef',
        poste: 'Chef de projet',
        email: 'youssef.karray@gerai.tn',
        statut: 'ACTIF',
        telephone: '+216 71 000 003',
        dateEmbauche: '2019-01-10',
        departement: 'Management',
        manager: 'Stéphane Manager',
        competences: ['Scrum', 'Jira', 'MS Project'],
        keycloakId: crypto.randomUUID(),
        present: true
    }
];

export let nextMembreId = 4;

export function getNextMembreId(): number {
    return nextMembreId++;
}
