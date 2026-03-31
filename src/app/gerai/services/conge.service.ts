import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import {
    SoldeConge,
    DemandeConge,
    StatistiquesConges,
    CongesComplet,
    CreateDemandeDTO
} from '../models/conge.model';

/**
 * Service pour la gestion des congés
 * Communique avec le backend (ou MSW en développement)
 */
@Injectable({
    providedIn: 'root'
})
export class CongesService {
    private http = inject(HttpClient);
    private baseUrl = '/api/conges';

    /* ══════════════════════════════════════════════════════════════
       📡 RÉCUPÉRATION DES DONNÉES
       ══════════════════════════════════════════════════════════════ */

    /**
     * Récupère le solde de congés
     */
    getSolde(): Observable<SoldeConge> {
        return this.http.get<SoldeConge>(`${this.baseUrl}/solde`);
    }

    /**
     * Récupère les demandes de congés
     */
    getMesDemandes(): Observable<DemandeConge[]> {
        return this.http.get<DemandeConge[]>(`${this.baseUrl}/mes-demandes`);
    }

    /**
     * Récupère les statistiques
     */
    getStatistiques(): Observable<StatistiquesConges> {
        return this.http.get<StatistiquesConges>(`${this.baseUrl}/statistiques`);
    }

    /**
     * ✨ OPTIMISATION: Récupère toutes les données en une seule requête
     * Utilise un endpoint dédié côté backend
     */
    getCongesComplet(): Observable<CongesComplet> {
        return this.http.get<CongesComplet>(`${this.baseUrl}/complet`);
    }

    /**
     * Alternative: Charge tout en parallèle avec forkJoin
     * (si le backend n'a pas d'endpoint /complet)
     */
    getCongesCompletParallele(): Observable<CongesComplet> {
        return forkJoin({
            solde: this.getSolde(),
            demandes: this.getMesDemandes(),
            statistiques: this.getStatistiques()
        });
    }

    /* ══════════════════════════════════════════════════════════════
       ✏️ ACTIONS
       ══════════════════════════════════════════════════════════════ */

    /**
     * Crée une nouvelle demande de congé
     */
    creerDemande(demande: CreateDemandeDTO): Observable<DemandeConge> {
        return this.http.post<DemandeConge>(`${this.baseUrl}/demander`, demande);
    }

    /**
     * Annule une demande en attente
     */
    annulerDemande(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}