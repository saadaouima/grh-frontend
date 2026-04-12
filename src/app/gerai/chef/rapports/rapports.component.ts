import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { RapportService }      from 'src/app/gerai/services/rapport-chef.service';
import { StatCard, RapportRow, RapportData } from 'src/app/theme/shared/interfaces/rapport';

type TabType = 'CONGES' | 'FORMATIONS' | 'PROJETS' | 'PERFORMANCE';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, SharedModule, BreadcrumbComponent],
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss']
})
export class RapportsComponent implements OnInit {

  private rapportService = inject(RapportService);
  private cdr            = inject(ChangeDetectorRef);

  activeTab  : TabType = 'CONGES';
  loading    = false;
  error      : string | null = null;
  isExporting = false;

  stats : StatCard[]   = [];
  rows  : RapportRow[] = [];

  tabs = [
    { value: 'CONGES',      label: 'Congés',      icon: 'ti ti-calendar-off' },
    { value: 'FORMATIONS',  label: 'Formations',  icon: 'ti ti-school'        },
    { value: 'PROJETS',     label: 'Projets',     icon: 'ti ti-layout-kanban' },
    { value: 'PERFORMANCE', label: 'Performance', icon: 'ti ti-chart-bar'     }
  ];

  // ── Column config per tab ─────────────────────────────
  private readonly columnsMap: Record<TabType, string[]> = {
    CONGES:      ['employe', 'type', 'debut', 'fin', 'jours', 'statut'],
    FORMATIONS:  ['employe', 'formation', 'duree', 'cout', 'statut'],
    PROJETS:     ['projet', 'chef', 'equipe', 'progression', 'statut'],
    PERFORMANCE: ['employe', 'taches', 'ponctualite', 'score', 'appreciation']
  };

  readonly columnLabels: Record<string, string> = {
    employe: 'Employé', type: 'Type', debut: 'Début', fin: 'Fin',
    jours: 'Jours', statut: 'Statut', formation: 'Formation',
    duree: 'Durée', cout: 'Coût', projet: 'Projet', chef: 'Chef',
    equipe: 'Équipe', progression: 'Progression', taches: 'Tâches',
    ponctualite: 'Ponctualité', score: 'Score', appreciation: 'Appréciation'
  };

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.loadTab(this.activeTab);
  }

  // ── Tab switch ────────────────────────────────────────
  switchTab(tab: TabType): void {
    if (tab === this.activeTab) return;
    this.activeTab = tab;
    this.loadTab(tab);
  }

  // ── Data loading ──────────────────────────────────────
  private loadTab(tab: TabType): void {
    this.loading = true;
    this.error   = null;
    this.stats   = [];
    this.rows    = [];

    this.rapportService.getRapport(tab).subscribe({
      next: (data: RapportData) => {
        this.stats   = data.stats;
        this.rows    = data.rows;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = 'Erreur lors du chargement du rapport.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Computed ──────────────────────────────────────────
  get currentColumns(): string[] {
    return this.columnsMap[this.activeTab];
  }

  get currentTabLabel(): string {
    return this.tabs.find(t => t.value === this.activeTab)?.label ?? '';
  }

  // ── Display helpers ───────────────────────────────────
  statutClass(val: string | number | undefined): string {
    const s = String(val ?? '');
    if (s === 'Validé' || s === 'Complétée' || s === 'Terminé' || s === 'Excellent') return 'badge-success';
    if (s === 'En cours'  || s === 'Très bien')  return 'badge-primary';
    if (s === 'En attente'|| s === 'Bien')        return 'badge-warning';
    if (s === 'Refusé'    || s === 'En retard')   return 'badge-danger';
    return '';
  }

  // ── Export PDF ────────────────────────────────────────
  exportPdf(): void {
    this.isExporting = true;
    const url = `/api/rapports/export/${this.activeTab.toLowerCase()}`;
    fetch(url, { method: 'GET' })
      .then(res => {
        if (!res.ok) throw new Error('Export indisponible');
        return res.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `rapport-${this.activeTab.toLowerCase()}.pdf`;
        link.click();
      })
      .catch(() => {
        alert('Export PDF disponible après connexion au backend Jasper Reports.');
      })
      .finally(() => { this.isExporting = false; });
  }
}
