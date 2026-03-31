// Angular Import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// Project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

// ─── Interface Tâche ────────────────────────────────────────────────────────
export interface TacheKanban {
  id: number;
  titre: string;
  projet: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  prioriteColor: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
  echeance: Date;
  progression: number;
}

@Component({
  selector: 'app-liste-taches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CardComponent,
    DragDropModule
  ],
  templateUrl: './liste-taches.component.html',
  styleUrls: ['./liste-taches.component.scss']
})
export class ListeTachesComponent implements OnInit {

  // ── View Mode ───────────────────────────────────────
  viewMode: 'kanban' | 'list' = 'kanban';

  // ── Data ────────────────────────────────────────────
  taches: TacheKanban[] = [];
  tachesFiltrees: TacheKanban[] = [];

  // ── Stats ───────────────────────────────────────────
  totalTaches: number = 0;
  tachesAFaire: number = 0;
  tachesEnCours: number = 0;
  tachesTerminees: number = 0;

  // ── Filters ─────────────────────────────────────────
  searchTerm: string = '';
  selectedProjet: string = '';
  selectedPriorite: string = '';

  // ── Lifecycle ───────────────────────────────────────
  ngOnInit(): void {
    this.loadTaches();
  }

  // ── Load Data ───────────────────────────────────────
  loadTaches(): void {
    // TODO: Remplacer par appel API Spring Boot
    this.taches = [
      {
        id: 1,
        titre: 'Intégration API Spring Boot',
        projet: 'GerAI - RH',
        priorite: 'Haute',
        prioriteColor: '#EF4444',
        statut: 'EN_COURS',
        echeance: new Date('2024-02-28'),
        progression: 65
      },
      {
        id: 2,
        titre: 'Maquettes module RH',
        projet: 'GerAI - RH',
        priorite: 'Moyenne',
        prioriteColor: '#F59E0B',
        statut: 'EN_COURS',
        echeance: new Date('2024-03-05'),
        progression: 40
      },
      {
        id: 3,
        titre: 'Tests unitaires',
        projet: 'Formation API',
        priorite: 'Moyenne',
        prioriteColor: '#F59E0B',
        statut: 'A_FAIRE',
        echeance: new Date('2024-03-10'),
        progression: 0
      },
      {
        id: 4,
        titre: 'Documentation API',
        projet: 'Formation API',
        priorite: 'Basse',
        prioriteColor: '#10B981',
        statut: 'A_FAIRE',
        echeance: new Date('2024-03-15'),
        progression: 0
      },
      {
        id: 5,
        titre: 'Validation formulaires',
        projet: 'Module Absences',
        priorite: 'Haute',
        prioriteColor: '#EF4444',
        statut: 'A_FAIRE',
        echeance: new Date('2024-02-25'),
        progression: 0
      },
      {
        id: 6,
        titre: 'Migration base de données',
        projet: 'GerAI - RH',
        priorite: 'Haute',
        prioriteColor: '#EF4444',
        statut: 'TERMINEE',
        echeance: new Date('2024-02-15'),
        progression: 100
      },
      {
        id: 7,
        titre: 'Rapport mensuel',
        projet: 'GerAI - RH',
        priorite: 'Moyenne',
        prioriteColor: '#F59E0B',
        statut: 'TERMINEE',
        echeance: new Date('2024-02-20'),
        progression: 100
      }
    ];

    this.calculateStats();
    this.tachesFiltrees = [...this.taches];
  }

  // ── Calculate Stats ─────────────────────────────────
  calculateStats(): void {
    this.totalTaches = this.taches.length;
    this.tachesAFaire = this.taches.filter(t => t.statut === 'A_FAIRE').length;
    this.tachesEnCours = this.taches.filter(t => t.statut === 'EN_COURS').length;
    this.tachesTerminees = this.taches.filter(t => t.statut === 'TERMINEE').length;
  }

  // ── Get Tasks by Status ─────────────────────────────
  getTachesByStatut(statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE'): TacheKanban[] {
    return this.tachesFiltrees.filter(t => t.statut === statut);
  }

  // ── Drag & Drop Handler ─────────────────────────────
  onDrop(event: CdkDragDrop<TacheKanban[]>): void {
    if (event.previousContainer === event.container) {
      // Réorganisation dans la même colonne
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Déplacement vers une autre colonne
      const tache = event.previousContainer.data[event.previousIndex];
      
      // Mettre à jour le statut selon la colonne de destination
      const newStatut = this.getStatutFromContainer(event.container.id);
      tache.statut = newStatut;
      
      // Mettre à jour la progression
      if (newStatut === 'A_FAIRE') tache.progression = 0;
      else if (newStatut === 'EN_COURS') tache.progression = Math.max(tache.progression, 1);
      else if (newStatut === 'TERMINEE') tache.progression = 100;

      // Transférer la tâche
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.calculateStats();

      // TODO: Appel API pour sauvegarder le changement
      console.log(`Tâche ${tache.id} déplacée vers ${newStatut}`);
    }
  }

  // ── Get Statut from Container ID ────────────────────
  private getStatutFromContainer(containerId: string): 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' {
    if (containerId.includes('todo')) return 'A_FAIRE';
    if (containerId.includes('inProgress')) return 'EN_COURS';
    return 'TERMINEE';
  }

  // ── Filter Tasks ────────────────────────────────────
  filterTaches(): void {
    this.tachesFiltrees = this.taches.filter(tache => {
      const matchSearch = !this.searchTerm || 
        tache.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tache.projet.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchProjet = !this.selectedProjet || tache.projet === this.selectedProjet;
      const matchPriorite = !this.selectedPriorite || tache.priorite === this.selectedPriorite;

      return matchSearch && matchProjet && matchPriorite;
    });

    this.calculateStats();
  }

  // ── Reset Filters ───────────────────────────────────
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedProjet = '';
    this.selectedPriorite = '';
    this.filterTaches();
  }

  // ── Get Statut Label ────────────────────────────────
  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'A_FAIRE': 'À faire',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée'
    };
    return labels[statut] || statut;
  }

}