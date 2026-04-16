import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Demande } from 'src/app/gerai/models/demande.model';
@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private http = inject(HttpClient);
   private readonly API_URL = '/api/demandes';

  getDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.API_URL);
  }

  getDemandesRecentes(limit: number = 5): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.API_URL}/recentes?limit=${limit}`);
  }

  createDemande(demande: Partial<Demande>): Observable<Demande> {
    return this.http.post<Demande>(this.API_URL, demande);
  }
  validerDemande(id: number): Observable<Demande> {
    return this.http.put<Demande>(`${this.API_URL}/${id}/valider`, {});
  }
  refuserDemande(id: number, motif: string): Observable<Demande> {
    return this.http.put<Demande>(`${this.API_URL}/${id}/refuser`, { motif });
  }

  getDemandeById(id: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.API_URL}/${id}`);
  }

  annulerDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}