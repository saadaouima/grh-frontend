import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from 'src/app/gerai/models/projet.model';
import { Tache } from 'src/app/gerai/models/tache.model';
import { Employe } from 'src/app/gerai/models/employe.model';

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/affectation';

  // Récupérer tous les projets du chef
  getProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.API_URL}/projets`);
  }
  getTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.API_URL}/taches`);
  }
  // Récupérer les tâches d'un projet spécifique
  getTachesByProjet(projetNom: string): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.API_URL}/taches?projet=${projetNom}`);
  }

  // Créer une tâche
  createTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(`${this.API_URL}/taches`, tache);
  }

  // Modifier une tâche
  updateTache(id: number, tache: Tache): Observable<Tache> {
    return this.http.put<Tache>(`${this.API_URL}/taches/${id}`, tache);
  }

  // Supprimer une tâche
  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/taches/${id}`);
  }
}