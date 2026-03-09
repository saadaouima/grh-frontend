import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Tache } from 'src/app/theme/shared/interfaces/tache';


import Keycloak from 'keycloak-js';

export interface DemandeAValider {
  id: number;
  employeNom: string;
  employeInitiales: string;
  type: string;
  date: string;
  statut: 'EN_ATTENTE';
}

export interface MembreEquipe {
  id: number;
  nom: string;
  initiales: string;
  poste: string;
  couleur: string;
  present: boolean;
}

export interface ProjetChef {
  nom: string;
  avancement: number;
  membres: number;
  couleur: string;
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
  templateUrl: './dashboard-chef.html',
  styleUrls: ['./dashboard-chef.scss']
})
export class DashboardChefComponent implements OnInit {

  private keycloak = inject(Keycloak);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  userName: string = '';
  userEmail: string = '';
  userRoles: string[] = [];

  totalEmployes: number = 0;
  demandesEnAttente: number = 0;
  projetsActifs: number = 0;
  tauxPresenceEquipe: number = 0;

  demandesAValider: DemandeAValider[] = [
    { id: 1, employeNom: 'Nour El Houda', employeInitiales: 'NH', type: 'Congé', date: '2024-02-15', statut: 'EN_ATTENTE' },
    { id: 2, employeNom: 'Ahmed Ben Ali', employeInitiales: 'AB', type: 'Formation', date: '2024-02-14', statut: 'EN_ATTENTE' },
    { id: 3, employeNom: 'Sana Trabelsi', employeInitiales: 'ST', type: 'Document', date: '2024-02-13', statut: 'EN_ATTENTE' }
  ];

  equipe: MembreEquipe[] = [
    { id: 1, nom: 'Nour El Houda', initiales: 'NH', poste: 'Développeur Frontend', couleur: '#3B82F6', present: true },
    { id: 2, nom: 'Ahmed Ben Ali', initiales: 'AB', poste: 'Développeur Backend', couleur: '#8B5CF6', present: true },
    { id: 3, nom: 'Sana Trabelsi', initiales: 'ST', poste: 'Designer UI/UX', couleur: '#10B981', present: false },
    { id: 4, nom: 'Mohamed Karim', initiales: 'MK', poste: 'DevOps Engineer', couleur: '#F59E0B', present: true },
    { id: 5, nom: 'Rania Mejri', initiales: 'RM', poste: 'QA Engineer', couleur: '#EC4899', present: false }
  ];

  tachesEquipe: Tache[] = [
    { id: 1, titre: 'Intégration API Spring Boot', projet: 'GerAI', assigneA: 'Ahmed B.', priorite: 'Haute', prioriteColor: 'text-danger', echeance: '2024-02-20' },
    { id: 2, titre: 'Maquettes module RH', projet: 'GerAI', assigneA: 'Sana T.', priorite: 'Moyenne', prioriteColor: 'text-warning', echeance: '2024-02-22' },
    { id: 3, titre: 'Tests de performance', projet: 'Backend', assigneA: 'Rania M.', priorite: 'Basse', prioriteColor: 'text-info', echeance: '2024-03-01' },
    { id: 4, titre: 'CI/CD Pipeline', projet: 'DevOps', assigneA: 'Mohamed K.', priorite: 'Haute', prioriteColor: 'text-danger', echeance: '2024-02-18' }
  ];

  projets: ProjetChef[] = [
    { nom: 'GerAI - Module RH', avancement: 70, membres: 3, couleur: 'linear-gradient(90deg, #3B82F6, #6366F1)' },
    { nom: 'Module Absences', avancement: 45, membres: 2, couleur: 'linear-gradient(90deg, #F59E0B, #EF4444)' },
    { nom: 'Reporting BI', avancement: 85, membres: 4, couleur: 'linear-gradient(90deg, #10B981, #059669)' },
    { nom: 'Portail Collaborateur', avancement: 30, membres: 2, couleur: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }
  ];

  notifications = [
    { titre: 'Nouvelle demande de congé', date: 'Il y a 30 min', color: 'text-warning', icon: 'ti ti-hourglass' },
    { titre: 'Tâche "API" en retard', date: 'Il y a 2h', color: 'text-danger', icon: 'ti ti-alert-triangle' },
    { titre: 'Rapport mensuel disponible', date: "Aujourd'hui", color: 'text-primary', icon: 'ti ti-chart-bar' },
    { titre: 'Mohamed K. est absent', date: 'Ce matin', color: 'text-info', icon: 'ti ti-user-off' }
  ];

  loading = true;

  async ngOnInit() {
    await this.loadUserProfile();
    this.loadKPIs();
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 600);
  }

  async loadUserProfile() {
    try {
      if (!this.keycloak.authenticated) {
        await this.keycloak.login();
        return;
      }

      const token = this.keycloak.tokenParsed;
      this.userName = token?.['name'] || token?.['preferred_username'] || 'Chef';
      this.userEmail = token?.['email'] || '';

      this.userRoles = ((token?.['roles'] as string[]) || [])
        .filter(role => !ROLES_SYSTEME_KEYCLOAK.includes(role));

      this.cdr.detectChanges();
      console.log('✅ Profil Chef chargé:', token);
      console.log('✅ Rôles:', this.userRoles);

    } catch (error) {
      console.error('❌ Erreur profil:', error);
      this.userName = 'Chef';
      this.userEmail = '';
      this.cdr.detectChanges();
    }
  }

  loadKPIs() {
    this.totalEmployes = this.equipe.length;
    this.demandesEnAttente = this.demandesAValider.length;
    this.projetsActifs = this.projets.length;
    this.tauxPresenceEquipe = Math.round(
      (this.equipe.filter(m => m.present).length / this.equipe.length) * 100
    );
    this.cdr.detectChanges();
  }

  validerDemande(id: number) {
    this.demandesAValider = this.demandesAValider.filter(d => d.id !== id);
    this.demandesEnAttente = this.demandesAValider.length;
    this.cdr.detectChanges();
  }

  refuserDemande(id: number) {
    this.demandesAValider = this.demandesAValider.filter(d => d.id !== id);
    this.demandesEnAttente = this.demandesAValider.length;
    this.cdr.detectChanges();
  }

  voirProfil(id: number) { this.router.navigate(['/chef/equipe', id]); }
  voirTache(id: number) { this.router.navigate(['/chef/taches', id]); }
  naviguerVers(route: string) { this.router.navigate([route]); }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}