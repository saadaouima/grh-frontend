import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BajajChartComponent } from 'src/app/theme/shared/components/apexchart/bajaj-chart/bajaj-chart.component';
import { Demande } from 'src/app/theme/shared/interfaces/demande';
import { Tache } from 'src/app/theme/shared/interfaces/tache';

import Keycloak from 'keycloak-js';

const ROLES_SYSTEME_KEYCLOAK = [
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-gerai',
  'default-roles-master', 'create-realm', 'broker'
];

const ROLE_LABELS: Record<string, string> = {
  employe: '👤 Employé',
  manager: '🏢 Manager',
  rh: '🧑‍💼 Ressources Humaines',
  admin: '⚙️ Administrateur',
};

@Component({
  selector: 'app-dashboard-employe',
  standalone: true,
  imports: [CommonModule, SharedModule, BajajChartComponent],
  templateUrl: './dashboard-employe.html',
  styleUrls: ['./dashboard-employe.scss']
})
export class DashboardEmployeComponent implements OnInit {

  private keycloak = inject(Keycloak);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  userName: string = '';
  userEmail: string = '';
  userRoles: string[] = [];

  congesRestants: number = 0;
  demandesEnCours: number = 0;
  tachesActives: number = 0;
  tauxPresence: number = 0;

  demandesRecentes: Demande[] = [
    { id: 1, type: 'Congé', date: '2024-02-10', statut: 'En attente', statusColor: 'text-warning', bgColor: 'bg-light-warning', icon: 'ti ti-clock' },
    { id: 2, type: 'Formation', date: '2024-02-05', statut: 'Validée', statusColor: 'text-success', bgColor: 'bg-light-success', icon: 'ti ti-check' },
    { id: 3, type: 'Document', date: '2024-01-28', statut: 'Refusée', statusColor: 'text-danger', bgColor: 'bg-light-danger', icon: 'ti ti-x' }
  ];

  tachesRecentes: Tache[] = [
    { id: 1, titre: 'Développement module RH', projet: 'GerAI', priorite: 'Haute', prioriteColor: 'text-danger', echeance: '2024-02-20' },
    { id: 2, titre: 'Tests unitaires', projet: 'GerAI', priorite: 'Moyenne', prioriteColor: 'text-warning', echeance: '2024-02-25' },
    { id: 3, titre: 'Documentation API', projet: 'Backend', priorite: 'Basse', prioriteColor: 'text-info', echeance: '2024-03-01' }
  ];

  projets = [
    { nom: 'GerAI - RH', avancement: 70 },
    { nom: 'Module Absences', avancement: 45 },
    { nom: 'Reporting BI', avancement: 85 }
  ];

  notifications = [
    { titre: 'Demande de congé en attente', date: 'Il y a 1 jour', color: 'text-warning' },
    { titre: 'Tâche validée par le chef', date: 'Il y a 2 jours', color: 'text-success' },
    { titre: 'Nouveau message RH', date: 'Il y a 3 jours', color: 'text-primary' }
  ];

  loading = true;

  async ngOnInit() {
    await this.loadUserProfile();
    this.loadStatistiques();
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  async loadUserProfile() {
    try {
      if (!this.keycloak.authenticated) {
        await this.keycloak.login();
        return;
      }

      const token = this.keycloak.tokenParsed;
      this.userName = token?.['name'] || token?.['preferred_username'] || 'Utilisateur';
      this.userEmail = token?.['email'] || '';

      const tousLesRoles = (token?.['roles'] as string[]) || [];
      this.userRoles = tousLesRoles.filter(
        role => !ROLES_SYSTEME_KEYCLOAK.includes(role)
      );

      this.cdr.detectChanges();
      console.log('✅ Profil chargé:', token);
      console.log('✅ Rôles métier:', this.userRoles);

    } catch (error) {
      console.error('❌ Erreur profil:', error);
      this.userName = 'Utilisateur';
      this.userEmail = '';
      this.cdr.detectChanges();
    }
  }

  getRoleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role;
  }

  loadStatistiques() {
    this.congesRestants = 15;
    this.demandesEnCours = 2;
    this.tachesActives = 5;
    this.tauxPresence = 95.5;
    this.cdr.detectChanges();
  }

  naviguerVers(route: string) { this.router.navigate([route]); }
  voirDemande(id: number) { this.router.navigate(['/employe/demandes', id]); }
  voirTache(id: number) { this.router.navigate(['/employe/taches', id]); }

  // ✅ Corrigé
  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}