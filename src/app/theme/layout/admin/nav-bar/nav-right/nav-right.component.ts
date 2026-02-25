import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { SharedModule } from 'src/app/theme/shared/shared.module';

export interface NavNotification {
  id: number;
  titre: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  icon: string;
  date: Date;
  read: boolean;
  badge?: string;
}

export interface UserProfile {
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  photo: string;
}

// Liens du dropdown profil selon le rôle
export interface ProfileLink {
  label: string;
  icon: string;
  route: string;
}

const PROFILE_LINKS_EMPLOYE: ProfileLink[] = [
  { label: 'Mon profil',    icon: 'ti ti-user',      route: '/employe/profil'   },
  { label: 'Mes demandes',  icon: 'ti ti-file-text',  route: '/employe/demandes' },
  { label: 'Mes tâches',    icon: 'ti ti-checkbox',   route: '/employe/taches'   },
  { label: 'Mes projets',   icon: 'ti ti-briefcase',  route: '/employe/projets'  }
];

const PROFILE_LINKS_CHEF: ProfileLink[] = [
  { label: 'Mon Dashboard', icon: 'ti ti-layout-dashboard', route: '/chef/dashboard' },
  { label: 'Mon Équipe',    icon: 'ti ti-users',            route: '/chef/equipe'    },
  { label: 'Demandes',      icon: 'ti ti-clipboard-check',  route: '/chef/demandes'  },
  { label: 'Mes Projets',   icon: 'ti ti-briefcase',        route: '/chef/projets'   }
];

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {

  private keycloakService = inject(KeycloakService);

  userProfile: UserProfile = {
    nom: '',
    prenom: '',
    email: '',
    poste: '',
    photo: 'assets/images/user/avatar-2.jpg'
  };

  userRole: 'chef' | 'employe' = 'employe';
  profileLinks: ProfileLink[] = PROFILE_LINKS_EMPLOYE;

  notifications: NavNotification[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    this.detectRole();
    this.loadUserProfile();
    this.loadNotifications();
  }

  // ── Détection du rôle ─────────────────────────────
  detectRole(): void {
    const roles = this.keycloakService.getUserRoles();
    if (roles.includes('chef') || roles.includes('CHEF')) {
      this.userRole = 'chef';
      this.profileLinks = PROFILE_LINKS_CHEF;
    } else {
      this.userRole = 'employe';
      this.profileLinks = PROFILE_LINKS_EMPLOYE;
    }
  }

  // ── Profil Keycloak ────────────────────────────────
  async loadUserProfile(): Promise<void> {
    try {
      const profile = await this.keycloakService.loadUserProfile();
      const roles = this.keycloakService.getUserRoles();
      const isChef = roles.includes('chef') || roles.includes('CHEF');

      this.userProfile = {
        nom:    profile.lastName  || 'Utilisateur',
        prenom: profile.firstName || '',
        email:  profile.email     || '',
        poste:  isChef ? 'Chef de Projet' : 'Employé',
        photo:  'assets/images/user/avatar-2.jpg'
      };
    } catch {
      this.userProfile = {
        nom: 'Utilisateur', prenom: '', email: '',
        poste: 'Employé',
        photo: 'assets/images/user/avatar-2.jpg'
      };
    }
  }

  // ── Notifications ──────────────────────────────────
  loadNotifications(): void {
    this.notifications = [
      { id: 1, titre: 'Demande validée',        description: 'Votre congé du 01/03 a été approuvé.',     type: 'success', icon: 'ti-calendar-check',  date: new Date(Date.now() - 5  * 60000), read: false, badge: 'Validée' },
      { id: 2, titre: 'Nouvelle tâche assignée', description: 'Vous avez été assigné à "API Spring Boot".', type: 'info',    icon: 'ti-clipboard-check', date: new Date(Date.now() - 60 * 60000), read: false, badge: 'Nouveau' },
      { id: 3, titre: 'Formation confirmée',     description: 'Votre inscription "Angular Avancé" est ok.',type: 'warning', icon: 'ti-school',          date: new Date(Date.now() - 2  * 3600000), read: false },
      { id: 4, titre: 'Rappel réunion',          description: 'Réunion d\'équipe demain à 10h.',           type: 'info',    icon: 'ti-calendar-event',  date: new Date(Date.now() - 3  * 3600000), read: true  }
    ];
    this.updateUnreadCount();
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.updateUnreadCount();
  }

  markAsRead(id: number): void {
    const n = this.notifications.find(n => n.id === id);
    if (n) { n.read = true; this.updateUnreadCount(); }
  }

  getTimeAgo(date: Date): string {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60)  return 'À l\'instant';
    const m = Math.floor(s / 60);
    if (m < 60)  return `Il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `Il y a ${h}h`;
    return `Il y a ${Math.floor(h / 24)}j`;
  }

  getNotifIconClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-light-success', info: 'bg-light-primary',
      warning: 'bg-light-warning', danger: 'bg-light-danger'
    };
    return map[type] ?? 'bg-light-primary';
  }

  getBadgeClass(badge: string): string {
    if (badge === 'Validée') return 'bg-light-success text-success';
    if (badge === 'Nouveau') return 'bg-light-danger text-danger';
    return 'bg-light-primary text-primary';
  }

  getFullName(): string {
    return `${this.userProfile.prenom} ${this.userProfile.nom}`.trim() || 'Utilisateur';
  }

  getInitiales(): string {
    const p = this.userProfile.prenom?.charAt(0) ?? '';
    const n = this.userProfile.nom?.charAt(0) ?? '';
    return (p + n).toUpperCase() || 'U';
  }

  logout(): void {
    this.keycloakService.logout(window.location.origin);
  }
}