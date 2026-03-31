import { RapportData } from 'src/app/theme/shared/interfaces/rapport';

/**
 * MOCK_RAPPORTS
 * Note : Seule la section 'performance' est utilisée comme source de données finale.
 * Les autres sections (conges, projets, formations) sont désormais gérées par 
 * leurs services respectifs dans le composant.
 */
export const MOCK_RAPPORTS: Record<string, RapportData> = {
    performance: {
        stats: [
            {
                label: 'Présence Équipe',
                value: '94%',
                icon: 'ti ti-users',
                color: '#2ed8b6',
                trend: 'Stable',
                trendUp: true
            },
            {
                label: 'Score Moyen',
                value: '4.2/5',
                icon: 'ti ti-star',
                color: '#FFB64D',
                trend: '+0.3 ce trimestre',
                trendUp: true
            },
            {
                label: 'Tâches terminées',
                value: '128',
                icon: 'ti ti-checkbox',
                color: '#4680FF',
                trend: 'Ce mois-ci',
                trendUp: true
            }
        ],
        rows: [
            { employe: 'Sami Ben Ali', taches: 45, ponctualite: '98%', score: '4.5', appreciation: 'Excellent' },
            { employe: 'Ines Trabelsi', taches: 38, ponctualite: '95%', score: '4.2', appreciation: 'Très bien' },
            { employe: 'Mohamed Gharbi', taches: 30, ponctualite: '85%', score: '3.8', appreciation: 'Bien' },
            { employe: 'Ahmed Karim', taches: 15, ponctualite: '70%', score: '2.5', appreciation: 'En retard' },
            { employe: 'Nour El Houda', taches: 52, ponctualite: '99%', score: '4.9', appreciation: 'Excellent' }
        ]
    },

    // Structures vides pour les catégories qui seront désormais alimentées par les services
    conges: { stats: [], rows: [] },
    formations: { stats: [], rows: [] },
    projets: { stats: [], rows: [] }
};