export interface MessageDTO {
    id: number;
    conversationId: number;
    expediteurId: string;
    expediteurNom: string;
    contenu: string;
    dateEnvoi: string;
    typeMessage: 'TEXTE' | 'IMAGE' | 'FICHIER';
    fileUrl?: string;
    fileName?: string;
    statut?: string;
}

export interface ConversationDTO {
    id: number;
    participant1Id: string;
    participant2Id: string;
    participant1Nom: string;
    participant2Nom: string;
    dernierMessage?: string;
    dateDernierMessage?: string;
}

export interface TypingResponse {
    expediteurId: string;
    conversationId: number;
    typing: boolean;
}