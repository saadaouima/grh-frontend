import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Demande } from '../interfaces/demande';
@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/demandes`;

  getDemandes(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.apiUrl);
  }

  getDemandesRecentes(limit: number =5): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/recentes?limit=${limit}`);
  }

  createDemande(demande: Partial<Demande>): Observable<Demande> {
    return this.http.post<Demande>(this.apiUrl, demande);
  }
  validerDemande(id: number): Observable<Demande> {
    return this.http.put<Demande>(`${this.apiUrl}/${id}/valider`, {});
  }
  refuserDemande(id: number, motif: string): Observable<Demande> {
    return this.http.put<Demande>(`${this.apiUrl}/${id}/refuser`, { motif });
  }}