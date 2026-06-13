import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tache } from 'src/app/gerai/models/tache.model';

export interface CreateTachePayload {
  projectId: number;
  titre: string;
  description?: string;
  assignedTo?: number;
  prioritize?: string;
  echeance?: string;
  estimatedHours?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/affectation';

  getTaches(): Observable<Tache[]> {
    return this.http.get<any[]>(`${this.API_URL}/taches`).pipe(
      map(list => list.map(dto => this.toTache(dto)))
    );
  }

  getTachesByProjet(projetNom: string): Observable<Tache[]> {
    return this.http.get<any[]>(`${this.API_URL}/taches?projet=${projetNom}`).pipe(
      map(list => list.map(dto => this.toTache(dto)))
    );
  }

  createTache(payload: CreateTachePayload): Observable<Tache> {
    return this.http.post<any>(`${this.API_URL}/taches`, payload).pipe(
      map(dto => this.toTache(dto))
    );
  }

  updateTache(id: number, payload: CreateTachePayload): Observable<Tache> {
    return this.http.put<any>(`${this.API_URL}/taches/${id}`, payload).pipe(
      map(dto => this.toTache(dto))
    );
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/taches/${id}`);
  }

  private toTache(dto: any): Tache {
    return {
      id:           dto.id,
      titre:        dto.titre ?? '',
      projet:       dto.projetNom ?? dto.projet ?? '',
      priorite:     this.normalizePriorite(dto.priorite),
      prioriteColor: dto.projetCouleur ?? '#3B82F6',
      statut:       dto.statut,
      echeance:     dto.echeance ?? '',
      dateDebut:    dto.dateDebut,
      description:  dto.description,
      assigneA:     dto.assigneA ?? '',
      assignedTo:   dto.assignedTo ?? undefined,
      effortEstime: dto.estimatedHours ?? undefined,
      progression:  dto.progressPct ?? undefined
    };
  }

  private normalizePriorite(raw: string | null | undefined): 'Haute' | 'Moyenne' | 'Basse' {
    const map: Record<string, 'Haute' | 'Moyenne' | 'Basse'> = {
      haute: 'Haute', high: 'Haute',
      moyenne: 'Moyenne', medium: 'Moyenne', normale: 'Moyenne', normal: 'Moyenne',
      basse: 'Basse', low: 'Basse'
    };
    return map[(raw ?? '').toLowerCase()] ?? 'Moyenne';
  }
}
