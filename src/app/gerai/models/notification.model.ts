export interface Notification {
    id: number;
    titre: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
    icone: string;
    heure: string; // ISO string pour le transport JSON
    lue: boolean;
    role?: 'CHEF' | 'EMPLOYE';
    lien?: string;
}