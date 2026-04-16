import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Keycloak from 'keycloak-js';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ProfilEmployeService } from '../services/employe-profile.service';
import { DemandeService } from '../services/demande.service';
import { TacheService } from '../services/tache-employe.service';
import { ProjetService } from '../services/projet-employe.service';
import { Demande } from '../models/demande.model';
import { TacheKanban } from '../models/tache.model';
import { Projet, StatutProjet } from '../models/projet.model';
import { StatistiquesEmploye, PerformanceEmploye } from '../models/employe-profile.model';

const ROLES_SYSTEME_KEYCLOAK = [
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-gerai',
  'default-roles-master', 'create-realm', 'broker'
];

@Component({
  selector: 'app-dashboard-employe',
  standalone: true,
  imports: [CommonModule, SharedModule, NgApexchartsModule],
  templateUrl: './dashboard-employe.component.html',
  styleUrls: ['./dashboard-employe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardEmployeComponent implements OnInit {

  private keycloak       = inject(Keycloak);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);
  private profilService  = inject(ProfilEmployeService);
  private demandeService = inject(DemandeService);
  private tacheService   = inject(TacheService);
  private projetService  = inject(ProjetService);

  // ── Auth ──────���─────────────────────────────────────
  userName  = '';
  userEmail = '';
  userRoles: string[] = [];

  // ── KPIs ─────────────────────────────────────────────
  congesRestants   = 0;
  congesTotal      = 0;
  tachesActives    = 0;
  tauxPresence     = 0;

  // ── Demandes stats ────────────────────────────────────
  demandesEnAttente= 0;
  demandesValidees = 0;
  demandesRefusees = 0;

  // ── Performance ───────────────────────────────────────
  performance: PerformanceEmploye | null = null;

  // ── Tickets résolus — stacked bar chart ───────────────
  readonly ticketsChart = {
    series: [
      { name: 'Bugs corrigés',      data: [4, 7, 3, 8, 5, 6]  },
      { name: 'Tâches complétées',  data: [12, 15, 8, 14, 11, 18] },
      { name: 'Fonctionnalités livrées', data: [2, 4, 3, 5, 4, 7] }
    ],
    chart: {
      type: 'bar' as const,
      height: 230,
      stacked: true,
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#EF4444', '#6366F1', '#10B981'],
    dataLabels: { enabled: false },
    plotOptions: { bar: { horizontal: false, columnWidth: '52%' } },
    xaxis: { categories: ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'], labels: { style: { fontSize: '11px' } } },
    legend: { position: 'top' as const, fontSize: '11px' },
    tooltip: { theme: 'light' },
    grid: { borderColor: '#F1F5F9', strokeDashArray: 4 }
  };

  // ── Recent lists & project data ──────────────────────
  demandesRecentes    : Demande[]     = [];
  tachesRecentes      : TacheKanban[] = [];
  projetsEnCours      : Projet[]      = [];   // for circular chart (all EN_COURS)
  totalProjetsAssignes = 0;                   // KPI: all projects assigned

  readonly currentYear = new Date().getFullYear();

  loading = true;
  error   = false;

  ngOnInit(): void {
    this.loadIdentity();
    this.loadData();
  }

  // ── Identity from token (synchronous) ───────────────
  private loadIdentity(): void {
    const token = this.keycloak.tokenParsed as Record<string, any> | undefined;
    this.userName  = token?.['name'] || token?.['preferred_username'] || 'Utilisateur';
    this.userEmail = token?.['email'] || '';

    const realmRoles: string[]  = token?.['realm_access']?.['roles'] ?? [];
    const clientRoles: string[] = Object.values(token?.['resource_access'] ?? {})
      .flatMap((r: any) => r?.roles ?? []);
    this.userRoles = [...new Set([...realmRoles, ...clientRoles])]
      .filter(r => !ROLES_SYSTEME_KEYCLOAK.includes(r));
  }

  // ── Backend data ────────────────────────���────────────
  private loadData(): void {
    forkJoin({
      stats      : this.profilService.getStatistiques(),
      demandes   : this.demandeService.getDemandes(),
      taches     : this.tacheService.getTaches(),
      projets    : this.projetService.getProjets(),
      performance: this.profilService.getPerformance()
    }).subscribe({
      next: ({ stats, demandes, taches, projets, performance }) => {
        this.applyStats(stats);
        this.applyDemandes(demandes);
        this.applyTaches(taches);
        this.applyProjets(projets);
        this.performance = performance;
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

  private applyStats(stats: StatistiquesEmploye): void {
    this.congesRestants = stats.congesRestants;
    this.congesTotal    = stats.congesTotal ?? 30;
    this.tauxPresence   = stats.tauxPresence;
    this.tachesActives  = stats.tachesTotal - stats.tachesCompletes;
  }

  private applyDemandes(demandes: Demande[]): void {
    this.demandesEnAttente = demandes.filter(d => d.statut === 'EN_ATTENTE').length;
    this.demandesValidees  = demandes.filter(d => ['VALIDEE', 'VALIDEE_CHEF', 'VALIDEE_RH'].includes(d.statut)).length;
    this.demandesRefusees  = demandes.filter(d => d.statut === 'REJETEE').length;
    // Most recent 3
    this.demandesRecentes = [...demandes]
      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
      .slice(0, 3);
  }

  private applyTaches(taches: TacheKanban[]): void {
    // Top 3 non-terminated sorted by deadline
    this.tachesRecentes = taches
      .filter(t => t.statut !== 'TERMINEE')
      .sort((a, b) => new Date(a.echeance).getTime() - new Date(b.echeance).getTime())
      .slice(0, 3);
  }

  private applyProjets(projets: Projet[]): void {
    this.totalProjetsAssignes = projets.length;
    this.projetsEnCours = projets.filter(p => p.statut === StatutProjet.EN_COURS);
  }

  // ── Computed getters ─────────────────────────────────
  get congesPris(): number { return this.congesTotal - this.congesRestants; }

  get congesPct(): number {
    return this.congesTotal > 0 ? Math.round((this.congesRestants / this.congesTotal) * 100) : 0;
  }

  get prochaineTache(): TacheKanban | null {
    return this.tachesRecentes[0] ?? null;
  }

  get joursAvantEcheance(): number | null {
    const t = this.prochaineTache;
    if (!t) return null;
    const diff = new Date(t.echeance).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ── Template helpers ──────────────────────────────────
  statutColor(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'text-warning', 'VALIDEE_CHEF': 'text-success',
      'VALIDEE_RH': 'text-success',  'VALIDEE': 'text-success',
      'REJETEE': 'text-danger'
    };
    return map[statut] ?? 'text-secondary';
  }

  statutBg(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'bg-light-warning', 'VALIDEE_CHEF': 'bg-light-success',
      'VALIDEE_RH': 'bg-light-success',  'VALIDEE': 'bg-light-success',
      'REJETEE': 'bg-light-danger'
    };
    return map[statut] ?? 'bg-light';
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente', 'VALIDEE_CHEF': 'Validée chef',
      'VALIDEE_RH': 'Validée RH', 'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée'
    };
    return map[statut] ?? statut;
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'CONGE': 'ti-beach', 'FORMATION': 'ti-school',
      'DOCUMENT_ADMINISTRATIF': 'ti-file-text',
      'PRET': 'ti-coin', 'AUTRE': 'ti-dots'
    };
    return map[type] ?? 'ti-file';
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      employe: 'Employé', manager: 'Manager',
      rh: 'Ressources Humaines', admin: 'Administrateur', chef: 'Chef de Projet'
    };
    return map[role.toLowerCase()] ?? role;
  }

  isLate(echeance: string): boolean {
    return new Date(echeance) < new Date();
  }

  // ── Navigation ─────────────────��──────────────────────
  naviguerVers(route: string): void { this.router.navigate([route]); }
  voirDemande(id: number): void     { this.router.navigate(['/employe/demandes', id]); }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
