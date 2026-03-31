import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Projet } from '../../theme/shared/interfaces/projet';

@Injectable({
    providedIn: 'root'
})
export class ProjetService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/projets`;

    getMesProjets(): Observable<Projet[]> {
        return this.http.get<Projet[]>(`${this.apiUrl}/mes-projets`);
    }

    getProjetById(id: number): Observable<Projet> {
        return this.http.get<Projet>(`${this.apiUrl}/${id}`);
    }
}