import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConversationDTO, MessageDTO } from '../models/chat.models';

/**
 * ChatApiService
 * ─────────────────────────────────────────
 * Centralise tous les appels HTTP liés au chat.
 *
 * Compatible :
 * - Backend Spring Boot (prod)
 * - MSW (dev)
 */
@Injectable({
    providedIn: 'root'
})
export class ChatApiService {

    private http = inject(HttpClient);

    /**
     * apiUrl = http://localhost:8085/api
     */
    private baseUrl = `${environment.apiUrl}/chat`;

    /* ══════════════════════════════════════════════════════════════
       👥 UTILISATEURS (Keycloak via backend)
       ══════════════════════════════════════════════════════════════ */

    getUtilisateurs(): Observable<{
        id: string;
        username: string;
        nomComplet: string;
    }[]> {
        return this.http.get<{
            id: string;
            username: string;
            nomComplet: string;
        }[]>(
            `${environment.apiUrl}/keycloak/users`
        );
    }

    /* ══════════════════════════════════════════════════════════════
       💬 CONVERSATIONS
       ══════════════════════════════════════════════════════════════ */

    getConversations(): Observable<ConversationDTO[]> {
        return this.http.get<ConversationDTO[]>(
            `${this.baseUrl}/conversations`
        );
    }

    /**
     * Crée ou récupère une conversation existante
     * BODY JSON (et pas query params)
     */
    creerOuRecupererConversation(
        user2Id: string,
        user2Nom: string
    ): Observable<ConversationDTO> {
        return this.http.post<ConversationDTO>(
            `${this.baseUrl}/conversations`,
            {
                user2Id,
                user2Nom
            }
        );
    }

    /* ══════════════════════════════════════════════════════════════
       📨 MESSAGES
       ══════════════════════════════════════════════════════════════ */

    getMessages(conversationId: number): Observable<MessageDTO[]> {
        return this.http.get<MessageDTO[]>(
            `${this.baseUrl}/conversations/${conversationId}/messages`
        );
    }

    /**
     * Envoi message texte
     */
    envoyerMessage(payload: {
        conversationId: number;
        expediteurId: string;
        expediteurNom: string;
        destinataireId: string;
        contenu: string;
    }): Observable<MessageDTO> {
        return this.http.post<MessageDTO>(
            `${this.baseUrl}/send`,
            payload
        );
    }

    /**
     * Upload fichier (image ou document)
     */
    uploadFichier(
        file: File,
        conversationId: number,
        destinataireId: string
    ): Observable<MessageDTO> {

        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', String(conversationId));
        formData.append('destinataireId', destinataireId);

        return this.http.post<MessageDTO>(
            `${this.baseUrl}/upload`,
            formData
        );
    }

    /* ══════════════════════════════════════════════════════════════
       ✅ STATUTS
       ══════════════════════════════════════════════════════════════ */

    marquerCommeLu(
        conversationId: number
    ): Observable<{ success: boolean }> {
        return this.http.post<{ success: boolean }>(
            `${this.baseUrl}/read/${conversationId}`,
            {}
        );
    }

    effacerMessages(
        conversationId: number
    ): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(
            `${this.baseUrl}/conversations/${conversationId}/messages`
        );
    }
}