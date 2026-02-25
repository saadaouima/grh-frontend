// Angular Import
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Project import - Template Berry Components
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BajajChartComponent } from 'src/app/theme/shared/components/apexchart/bajaj-chart/bajaj-chart.component';

// Keycloak
import { KeycloakService } from 'keycloak-angular';

// Interfaces
import { Demande } from 'src/app/theme/shared/interfaces/demande';
import { Tache } from 'src/app/theme/shared/interfaces/tache';

// Rôles Keycloak système à exclure (pas de sens métier)
const ROLES_SYSTEME_KEYCLOAK = [
  'offline_access',
  'uma_authorization',
  'manage-account',
  'manage-account-links',
  'view-profile',
  'default-roles-gerai',
  'default-roles-master',
  'create-realm',
  'broker'
];

// Labels lisibles pour les rôles métier GerAI
const ROLE_LABELS: Record<string, string> = {
  employe:  '👤 Employé',
  manager:  '🏢 Manager',
  rh:       '🧑‍💼 Ressources Humaines',
  admin:    '⚙️ Administrateur',
  // Ajoutez vos rôles ici
};

@Component({
  selector: 'app-dashboard-employe',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    BajajChartComponent
  ],
  templateUrl: './dashboard-employe.html',
  styleUrls: ['./dashboard-employe.scss']
})
export class DashboardEmployeComponent implements OnInit {

  // Services
  private keycloakService = inject(KeycloakService);
  private router          = inject(Router);
  private cdr             = inject(ChangeDetectorRef);

  // Données utilisateur Keycloak
  userName:  string   = '';
  userEmail: string   = '';
  userRoles: string[] = [];

  // Statistiques RH (KPIs)
  congesRestants:  number = 0;
  demandesEnCours: number = 0;
  tachesActives:   number = 0;
  tauxPresence:    number = 0;

  // Demandes récentes
  demandesRecentes: Demande[] = [
    { id: 1, type: 'Congé',     date: '2024-02-10', statut: 'En attente', statusColor: 'text-warning', bgColor: 'bg-light-warning', icon: 'ti ti-clock' },
    { id: 2, type: 'Formation', date: '2024-02-05', statut: 'Validée',    statusColor: 'text-success', bgColor: 'bg-light-success', icon: 'ti ti-check' },
    { id: 3, type: 'Document',  date: '2024-01-28', statut: 'Refusée',    statusColor: 'text-danger',  bgColor: 'bg-light-danger',  icon: 'ti ti-x'     }
  ];

  // Tâches récentes
  tachesRecentes: Tache[] = [
    { id: 1, titre: 'Développement module RH', projet: 'GerAI',   priorite: 'Haute',  prioriteColor: 'text-danger',  echeance: '2024-02-20' },
    { id: 2, titre: 'Tests unitaires',          projet: 'GerAI',   priorite: 'Moyenne',prioriteColor: 'text-warning', echeance: '2024-02-25' },
    { id: 3, titre: 'Documentation API',        projet: 'Backend', priorite: 'Basse',  prioriteColor: 'text-info',    echeance: '2024-03-01' }
  ];

  // Projets
  projets = [
    { nom: 'GerAI - RH',       avancement: 70 },
    { nom: 'Module Absences',   avancement: 45 },
    { nom: 'Reporting BI',      avancement: 85 }
  ];

  // Notifications
  notifications = [
    { titre: 'Demande de congé en attente', date: 'Il y a 1 jour',  color: 'text-warning' },
    { titre: 'Tâche validée par le chef',   date: 'Il y a 2 jours', color: 'text-success' },
    { titre: 'Nouveau message RH',          date: 'Il y a 3 jours', color: 'text-primary' }
  ];

  loading = true;

  // ─── Lifecycle ──────────────────────────────────────
  async ngOnInit() {
    await this.loadUserProfile();
    this.loadStatistiques();

    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges(); // force la mise à jour de la vue
    }, 800);
  }

  // ─── Charger profil Keycloak ────────────────────────
  // FIX : on attend que Keycloak soit prêt avec isLoggedIn()
  // avant de charger le profil, ce qui résout l'affichage tardif.
  async loadUserProfile() {
    try {
      const isLogged = await this.keycloakService.isLoggedIn();

      if (!isLogged) {
        console.warn('⚠️ Utilisateur non connecté, redirection login...');
        await this.keycloakService.login();
        return;
      }

      // Keycloak est prêt : charger le profil
      const profile = await this.keycloakService.loadUserProfile();

      this.userName  = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Utilisateur';
      this.userEmail = profile.email || '';

      // Filtrer les rôles système, garder uniquement les rôles métier GerAI
      const tousLesRoles = this.keycloakService.getUserRoles();
      this.userRoles = tousLesRoles.filter(
        role => !ROLES_SYSTEME_KEYCLOAK.includes(role)
      );

      // Forcer la mise à jour immédiate de la vue (pas d'attente de cycle Angular)
      this.cdr.detectChanges();

      console.log('✅ Profil Keycloak chargé:', profile);
      console.log('✅ Rôles métier:', this.userRoles);

    } catch (error) {
      console.error('❌ Erreur profil Keycloak:', error);
      this.userName  = 'Utilisateur';
      this.userEmail = '';
      this.cdr.detectChanges();
    }
  }

  // ─── Libellé lisible d'un rôle ──────────────────────
  getRoleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role;
  }

  // ─── Statistiques RH ────────────────────────────────
  loadStatistiques() {
    // TODO: Remplacer par appels API Spring Boot
    this.congesRestants  = 15;
    this.demandesEnCours = 2;
    this.tachesActives   = 5;
    this.tauxPresence    = 95.5;
    this.cdr.detectChanges();
  }

  // ─── Navigation ─────────────────────────────────────
  naviguerVers(route: string) {
    this.router.navigate([route]);
  }

  voirDemande(demandeId: number) {
    this.router.navigate(['/employe/demandes', demandeId]);
  }

  voirTache(tacheId: number) {
    this.router.navigate(['/employe/taches', tacheId]);
  }

  // ─── Déconnexion ────────────────────────────────────
  logout() {
    this.keycloakService.logout(window.location.origin);
  }
}