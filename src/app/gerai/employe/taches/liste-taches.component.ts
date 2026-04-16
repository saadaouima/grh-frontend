import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { TacheService } from 'src/app/gerai/services/tache-employe.service';
import { TacheKanban } from 'src/app/gerai/models/tache.model';

@Component({
  selector: 'app-liste-taches',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent, DragDropModule],
  templateUrl: './liste-taches.component.html',
  styleUrls: ['./liste-taches.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListeTachesComponent implements OnInit {

  private cdr          = inject(ChangeDetectorRef);
  private tacheService = inject(TacheService);

  viewMode: 'kanban' | 'list' = 'kanban';

  taches        : TacheKanban[] = [];
  tachesFiltrees: TacheKanban[] = [];

  totalTaches   = 0;
  tachesAFaire  = 0;
  tachesEnCours = 0;
  tachesTerminees = 0;

  searchTerm      = '';
  selectedProjet  = '';
  selectedPriorite= '';

  loading = true;
  error   = false;

  // ── Lifecycle ────────────────────────────────────
  ngOnInit(): void {
    this.tacheService.getTaches().subscribe({
      next: taches => {
        this.taches         = taches;
        this.tachesFiltrees = [...taches];
        this.calculateStats();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  calculateStats(): void {
    this.totalTaches    = this.taches.length;
    this.tachesAFaire   = this.taches.filter(t => t.statut === 'A_FAIRE').length;
    this.tachesEnCours  = this.taches.filter(t => t.statut === 'EN_COURS').length;
    this.tachesTerminees= this.taches.filter(t => t.statut === 'TERMINEE').length;
  }

  getTachesByStatut(statut: TacheKanban['statut']): TacheKanban[] {
    return this.tachesFiltrees.filter(t => t.statut === statut);
  }

  // ── Drag & Drop ─────────────────────────────────
  onDrop(event: CdkDragDrop<TacheKanban[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const tache    = event.previousContainer.data[event.previousIndex];
    const newStatut = this.statutFromContainerId(event.container.id);

    const newProgression =
      newStatut === 'A_FAIRE'  ? 0 :
      newStatut === 'EN_COURS' ? Math.max(tache.progression, 1) : 100;

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    // Optimistic update then sync to backend
    tache.statut      = newStatut;
    tache.progression = newProgression;
    this.calculateStats();
    this.cdr.markForCheck();

    this.tacheService.updateTache(tache.id, { statut: newStatut, progression: newProgression })
      .subscribe(); // fire-and-forget; backend MSW will persist
  }

  private statutFromContainerId(id: string): TacheKanban['statut'] {
    if (id.includes('todo'))       return 'A_FAIRE';
    if (id.includes('inProgress')) return 'EN_COURS';
    return 'TERMINEE';
  }

  // ── Filters ──────────────────────────────────────
  filterTaches(): void {
    this.tachesFiltrees = this.taches.filter(t => {
      const matchSearch   = !this.searchTerm ||
        t.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.projet.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchProjet   = !this.selectedProjet   || t.projet   === this.selectedProjet;
      const matchPriorite = !this.selectedPriorite || t.priorite === this.selectedPriorite;
      return matchSearch && matchProjet && matchPriorite;
    });
    this.calculateStats();
  }

  resetFilters(): void {
    this.searchTerm       = '';
    this.selectedProjet   = '';
    this.selectedPriorite = '';
    this.filterTaches();
  }

  get projetsUniques(): string[] {
    return [...new Set(this.taches.map(t => t.projet))];
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINEE: 'Terminée'
    };
    return map[statut] ?? statut;
  }

  isLate(echeance: string): boolean {
    return new Date(echeance) < new Date();
  }
}
