import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DemandeService } from 'src/app/gerai/services/demande.service';
import { TacheService } from 'src/app/gerai/services/tache-chef.service';
import { ProjetService } from 'src/app/gerai/services/projet-chef.service';
import { EquipeApiService } from 'src/app/gerai/services/equipe-api.service';
import { Demande } from 'src/app/gerai/models/demande.model';
import { Tache } from 'src/app/gerai/models/tache.model';
import { Projet, StatutProjet } from 'src/app/gerai/models/projet.model';
import { MembreEquipe } from 'src/app/gerai/models/equipe.model';
import { PerformanceChef } from 'src/app/gerai/models/chef.model';
import { RapportService } from 'src/app/gerai/services/rapport-chef.service';
import Keycloak from 'keycloak-js';

export interface ChargeItem {
  nom: string;
  initiales: string;
  tachesActives: number;
  tachesEnRetard: number;
}

const ROLES_SYSTEME_KEYCLOAK = [
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-gerai',
  'default-roles-master', 'create-realm', 'broker'
];

@Component({
  selector: 'app-dashboard-chef',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard-chef.component.html',
  styleUrls: ['./dashboard-chef.component.scss']
})
export class DashboardChefComponent implements OnInit {

  private keycloak    = inject(Keycloak);
  private router      = inject(Router);
  private cdr         = inject(ChangeDetectorRef);
  private demandeService = inject(DemandeService);
  private tacheService   = inject(TacheService);
  private projetService  = inject(ProjetService);
  private equipeService  = inject(EquipeApiService);
  private rapportService = inject(RapportService);

  // ── Auth ────────────────────────────────────────────
  userName  = '';
  userEmail = '';

  // ── KPIs ────────────────────────────────────────────
  demandesEnAttente   = 0;
  tachesEnRetardCount = 0;
  absencesAujourdhui  = 0;
  projetsARisqueCount = 0;

  // ── Performance ──────────────────────────────────────
  performance: PerformanceChef | null = null;

  // ── Widget data ──────────────────────────────────────
  demandesAValider: Demande[]    = [];
  membres: MembreEquipe[]        = [];
  tachesEnRetardListe: Tache[]   = [];
  chargeParMembre: ChargeItem[]  = [];

  loading = true;

  private readonly today  = new Date();
  private readonly today7 = new Date(Date.now() + 7 * 86_400_000);

  // ── Lifecycle ────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    await this._loadUserProfile();
    this._loadData();
  }

  // ── Auth ─────────────────────────────────────────────
  private async _loadUserProfile(): Promise<void> {
    try {
      if (!this.keycloak.authenticated) { await this.keycloak.login(); return; }
      const token = this.keycloak.tokenParsed;
      this.userName  = token?.['name'] || token?.['preferred_username'] || 'Chef';
      this.userEmail = token?.['email'] || '';
    } catch {
      this.userName = 'Chef';
    }
  }

  // ── Data loading ─────────────────────────────────────
  private _loadData(): void {
    forkJoin({
      demandes   : this.demandeService.getDemandes(),
      taches     : this.tacheService.getTaches(),
      projets    : this.projetService.getProjets(),
      membres    : this.equipeService.getMembres(),
      performance: this.rapportService.getPerformanceChef()
    }).subscribe({
      next: ({ demandes, taches, projets, membres, performance }) => {
        this._computeAll(demandes, taches, projets, membres);
        this.performance = performance;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private _computeAll(
    demandes: Demande[],
    taches:   Tache[],
    projets:  Projet[],
    membres:  MembreEquipe[]
  ): void {
    // KPI 1 — Demandes en attente
    const enAttente = demandes.filter(d => d.statut === 'EN_ATTENTE');
    this.demandesEnAttente = enAttente.length;
    this.demandesAValider  = enAttente.slice(0, 5);

    // KPI 2 — Tâches en retard
    const retard = taches.filter(t =>
      t.statut !== 'TERMINEE' && new Date(t.echeance) < this.today
    );
    this.tachesEnRetardCount = retard.length;
    this.tachesEnRetardListe = retard
      .sort((a, b) => new Date(a.echeance).getTime() - new Date(b.echeance).getTime())
      .slice(0, 6);

    // KPI 3 — Absences aujourd'hui
    this.membres = membres;
    this.absencesAujourdhui = membres.filter(m => m.statut === 'CONGE').length;

    // KPI 4 — Projets à risque
    this.projetsARisqueCount = projets.filter(p => this._isARisque(p)).length;

    // Charge de travail par membre
    this.chargeParMembre = this._computeCharge(membres, taches);
  }

  private _isARisque(p: Projet): boolean {
    if (p.statut === StatutProjet.TERMINE) return false;
    if (p.statut === StatutProjet.EN_RETARD) return true;
    const deadline = p.dateFin ?? p.dateEcheance;
    if (!deadline) return false;
    return new Date(deadline) <= this.today7 && p.progression < 80;
  }

  private _computeCharge(membres: MembreEquipe[], taches: Tache[]): ChargeItem[] {
    return membres
      .map(m => {
        const nomComplet = `${m.prenom} ${m.nom}`;
        const miennes = taches.filter(t =>
          t.assigneNom === nomComplet || t.assigneA === nomComplet
        );
        return {
          nom: nomComplet,
          initiales: (m.prenom[0] + m.nom[0]).toUpperCase(),
          tachesActives:  miennes.filter(t => t.statut !== 'TERMINEE').length,
          tachesEnRetard: miennes.filter(t =>
            t.statut !== 'TERMINEE' && new Date(t.echeance) < this.today
          ).length
        };
      })
      .sort((a, b) => b.tachesActives - a.tachesActives);
  }

  get maxCharge(): number {
    return Math.max(...this.chargeParMembre.map(c => c.tachesActives), 1);
  }

  get membresPresents(): number {
    return this.membres.length - this.absencesAujourdhui;
  }

  // ── Navigation ───────────────────────────────────────
  naviguerVers(route: string) { this.router.navigate([route]); }

  naviguerVersDemandesEnAttente() {
    this.router.navigate(['/chef/demandes'], { queryParams: { statut: 'EN_ATTENTE' } });
  }

  logout() { this.keycloak.logout({ redirectUri: window.location.origin }); }
}
