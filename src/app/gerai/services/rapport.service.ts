import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RapportData } from 'src/app/theme/shared/interfaces/rapport';

@Injectable({ providedIn: 'root' })
export class RapportService {
    private http = inject(HttpClient);
    private readonly API_URL = '/api/rapports';

    /**
     * Récupère les données d'un rapport par son type.
     * Note : Selon votre nouvelle logique, cela sera principalement utilisé 
     * pour le type 'performance' qui est resté mocké.
     * @param type 'performance' | 'conges' | 'formations' | 'projets'
     */
    getRapportByType(type: string): Observable<RapportData> {
        return this.http.get<RapportData>(`${this.API_URL}/${type.toLowerCase()}`);
    }

    /**
     * Déclenche l'export PDF pour un type de rapport donné.
     * @param type Le type de rapport à exporter
     */
    exportPdf(type: string): Observable<Blob> {
        // On s'assure d'envoyer le type en minuscule pour correspondre aux handlers MSW
        return this.http.get(`${this.API_URL}/export/${type.toLowerCase()}`, {
            responseType: 'blob'
        });
    }

    /**
     * Méthode utilitaire pour formater les données brutes issues d'autres services 
     * au format RapportData (utile si vous voulez centraliser le mapping ici).
     */
    formatToRapportData(stats: any[], rows: any[]): RapportData {
        return {
            stats: stats,
            rows: rows
        };
    }
}