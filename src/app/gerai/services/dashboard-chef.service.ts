import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    KPIsChef,
    DemandeChef,
    MembreEquipe,
    TacheChef,
    ProjetChef,
    NotificationChef
} from '../models/chef.models';

/**
 * Service pour le Dashboard Chef
 * Communique avec le backend (ou MSW en développement)
 */
@Injectable({
    providedIn: 'root'
})
export class DashboardChefService {
    private http = inject(HttpClient);
    private baseUrl = '/api/chef';

    /* ══════════════════════════════════════════════════════════════
       📊 KPIs
       ══════════════════════════════════════════════════════════════ */

    /**
     * Récupère les indicateurs clés de performance
     */
    getKPIs(): Observable<KPIsChef> {
        return this.http.get<KPIsChef>(`${this.baseUrl}/kpis`);
    }

    /* ══════════════════════════════════════════════════════════════
       📋 DEMANDES
       ══════════════════════════════════════════════════════════════ */

    /**
     * Récupère les demandes en attente de validation
     * @param statut - 'toutes' pour récupérer toutes les demandes
     */
    getDemandes(statut: 'en_attente' | 'toutes' = 'en_attente'): Observable<DemandeChef[]> {
        const params = statut === 'toutes' ? { statut: 'toutes' } : {};
        return this.http.get<DemandeChef[]>(`${this.baseUrl}/demandes`, { params });
    }

    /**
     * Valide une demande
     */
    validerDemande(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/demandes/${id}/valider`,
            {}
        );
    }

    /**
     * Refuse une demande
     */
    refuserDemande(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(
            `${this.baseUrl}/demandes/${id}/refuser`,
            {}
        );
    }

    /* ══════════════════════════════════════════════════════════════
       👥 ÉQUIPE
       ══════════════════════════════════════════════════════════════ */

    /**
     * Récupère la liste des membres de l'équipe
     */
    getEquipe(): Observable<MembreEquipe[]> {
        return this.http.get<MembreEquipe[]>(`${this.baseUrl}/equipe`);
    }

    /* ══════════════════════════════════════════════════════════════
       ✅ TÂCHES
       ══════════════════════════════════════════════════════════════ */

    /**
     * Récupère les tâches de l'équipe
     */
    getTaches(): Observable<TacheChef[]> {
        return this.http.get<TacheChef[]>(`${this.baseUrl}/taches`);
    }

    /* ══════════════════════════════════════════════════════════════
       🚀 PROJETS
       ══════════════════════════════════════════════════════════════ */

    /**
     * Récupère les projets en cours
     */
    getProjets(): Observable<ProjetChef[]> {
        return this.http.get<ProjetChef[]>(`${this.baseUrl}/projets`);
    }

    /* ══════════════════════════════════════════════════════════════
       🔔 NOTIFICATIONS
       ══════════════════════════════════════════════════════════════ */

    /**
     * Récupère les notifications du chef
     */
    getNotifications(): Observable<NotificationChef[]> {
        return this.http.get<NotificationChef[]>(`${this.baseUrl}/notifications`);
    }
}