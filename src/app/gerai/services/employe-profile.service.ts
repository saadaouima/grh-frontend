import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import Keycloak from 'keycloak-js';

import {
    ProfilEmploye,
    DocumentEmploye,
    ActiviteEmploye,
    StatistiquesEmploye,
    UpdateProfilDTO,
    ProfilComplet
} from 'src/app/gerai/models/employe-profile.model';

@Injectable({
    providedIn: 'root'
})
export class ProfilEmployeService {

    private http = inject(HttpClient);
    private keycloak = inject(Keycloak);
    private baseUrl = '/api/employe';

    /* ════════════════════════════════════════════
       👤 PROFIL (Fusion token Keycloak + Backend)
    ════════════════════════════════════════════ */

    getProfil(): Observable<ProfilEmploye> {
        // Extract identity directly from the parsed JWT — synchronous, no round-trip needed
        const token = this.keycloak.tokenParsed as Record<string, any> | undefined;

        const id        = token?.['sub']              ?? '';
        const prenom    = token?.['given_name']       ?? token?.['preferred_username'] ?? '';
        const nom       = token?.['family_name']      ?? '';
        const nomComplet= token?.['name']             ?? `${prenom} ${nom}`.trim();
        const email     = token?.['email']            ?? '';

        return this.http.get<ProfilEmploye>(`${this.baseUrl}/profil`).pipe(
            map(profilBackend => ({
                ...profilBackend,
                // Token values always win over backend for identity fields
                id,
                nom:        nom        || profilBackend.nom,
                prenom:     prenom     || profilBackend.prenom,
                nomComplet: nomComplet || profilBackend.nomComplet,
                email:      email      || profilBackend.email
            }))
        );
    }

    getProfilComplet(): Observable<ProfilComplet> {
        return forkJoin({
            profil: this.getProfil(),
            documents: this.getDocuments(),
            activites: this.getActivites(),
            statistiques: this.getStatistiques()
        });
    }

    updateProfil(updates: UpdateProfilDTO): Observable<ProfilEmploye> {
        return this.http.put<ProfilEmploye>(`${this.baseUrl}/profil`, updates);
    }

    /* ════════════════════════════════════════════
       📂 DOCUMENTS
    ════════════════════════════════════════════ */

    getDocuments(): Observable<DocumentEmploye[]> {
        return this.http.get<DocumentEmploye[]>(`${this.baseUrl}/documents`);
    }

    uploadDocument(formData: FormData): Observable<DocumentEmploye> {
        return this.http.post<DocumentEmploye>(
            `${this.baseUrl}/documents`,
            formData
        );
    }

    deleteDocument(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.baseUrl}/documents/${id}`
        );
    }

    downloadDocument(
        id: number,
        action: 'view' | 'download' = 'download'
    ): Observable<Blob> {
        return this.http.get(
            `${this.baseUrl}/documents/${id}/${action}`,
            { responseType: 'blob' }
        );
    }

    viewDocument(id: number): void {
        this.downloadDocument(id, 'view').subscribe(blob => {
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        });
    }

    forceDownload(id: number, filename?: string): void {
        this.downloadDocument(id, 'download').subscribe(blob => {
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename || `Document_${id}.pdf`;
            a.click();
            URL.revokeObjectURL(objectUrl);
        });
    }

    /* ════════════════════════════════════════════
       📊 ACTIVITÉS & STATS
    ════════════════════════════════════════════ */

    getActivites(): Observable<ActiviteEmploye[]> {
        return this.http.get<ActiviteEmploye[]>(
            `${this.baseUrl}/activites`
        );
    }

    getStatistiques(): Observable<StatistiquesEmploye> {
        return this.http.get<StatistiquesEmploye>(
            `${this.baseUrl}/statistiques`
        );
    }
}