import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from 'src/app/gerai/models/projet.model';
import { Employe } from 'src/app/gerai/models/employe.model';

@Injectable({
    providedIn: 'root'
})
export class ProjetService {
    private http = inject(HttpClient);
    private readonly API_URL = '/api/affectation';

    // --- PROJETS ---
    getProjets(): Observable<Projet[]> {
        return this.http.get<Projet[]>(`${this.API_URL}/projets`);
    }

    createProjet(projet: Projet): Observable<Projet> {
        return this.http.post<Projet>(`${this.API_URL}/projets`, projet);
    }

    updateProjet(id: number, projet: Projet): Observable<Projet> {
        return this.http.put<Projet>(`${this.API_URL}/projets/${id}`, projet);
    }

    deleteProjet(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/projets/${id}`);
    }

    // --- RÉFÉRENTIELS ---
    getEmployes(): Observable<Employe[]> {
        return this.http.get<Employe[]>(`${this.API_URL}/employes`);
    }
}