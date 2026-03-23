import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Tache } from '../../theme/shared/interfaces/tache';

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/taches`;

  getTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.apiUrl);
  }
  getTachesActives(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/actives`);
  }
  updateStatut(id: number, statut: string): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/${id}/statut`, { statut });
  }
}