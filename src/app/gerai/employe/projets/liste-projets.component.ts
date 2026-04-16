import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { ProjetService } from 'src/app/gerai/services/projet-employe.service';
import { Projet, TacheProjet, StatutProjet } from 'src/app/gerai/models/projet.model';

@Component({
  selector: 'app-liste-projets',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent],
  templateUrl: './liste-projets.component.html',
  styleUrls: ['./liste-projets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListeProjetsComponent implements OnInit {

  private cdr           = inject(ChangeDetectorRef);
  private projetService = inject(ProjetService);


  viewMode: 'grid' | 'list' = 'grid';

  projets         : Projet[]      = [];
  projetsFiltres  : Projet[]      = [];
  mesTachesRecentes: TacheProjet[] = [];

  totalProjets  = 0;
  projetsEnCours= 0;
  totalTaches   = 0;
  tauxCompletion= 0;

  searchTerm     = '';
  selectedStatut = '';
  loading        = true;
  error          = false;

  ngOnInit(): void {
    forkJoin({
      projets: this.projetService.getProjets(),
      taches : this.projetService.getMesTachesRecentes()
    }).subscribe({
      next: ({ projets, taches }) => {
        this.projets          = projets;
        this.mesTachesRecentes = taches;
        this.calculateStats();
        this.filterProjets();
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
    this.totalProjets   = this.projets.length;
    this.projetsEnCours = this.projets.filter(p => p.statut === StatutProjet.EN_COURS).length;
    this.totalTaches    = this.projets.reduce((s, p) => s + p.totalTaches, 0);
    const sum           = this.projets.reduce((s, p) => s + p.progression, 0);
    this.tauxCompletion = this.projets.length > 0 ? Math.round(sum / this.projets.length) : 0;
  }

  filterProjets(): void {
    this.projetsFiltres = this.projets.filter(p => {
      const matchSearch  = !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatut  = !this.selectedStatut || p.statut === this.selectedStatut;
      return matchSearch && matchStatut;
    });
  }

  resetFilters(): void {
    this.searchTerm     = '';
    this.selectedStatut = '';
    this.filterProjets();
  }

  toggleTache(tacheId: number): void {
    this.projetService.toggleTacheStatus(tacheId).subscribe({
      next: updated => {
        const idx = this.mesTachesRecentes.findIndex(t => t.id === tacheId);
        if (idx !== -1) {
          this.mesTachesRecentes = [
            ...this.mesTachesRecentes.slice(0, idx),
            updated,
            ...this.mesTachesRecentes.slice(idx + 1)
          ];
          this.cdr.markForCheck();
        }
      }
    });
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS: 'En cours', EN_PAUSE: 'En pause', TERMINE: 'Terminé', EN_RETARD: 'En retard'
    };
    return map[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS: 'badge-encours', EN_PAUSE: 'badge-pause',
      TERMINE: 'badge-termine',  EN_RETARD: 'badge-retard'
    };
    return map[statut] ?? '';
  }

  isLate(echeance: string): boolean {
    return new Date(echeance) < new Date();
  }
}
