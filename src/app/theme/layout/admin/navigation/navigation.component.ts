import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Keycloak from 'keycloak-js';

import { NavigationItem, NAV_CHEF, NAV_EMPLOYE } from './navigation';

const ROLES_SYSTEME = [
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-gerai',
  'default-roles-master', 'create-realm', 'broker'
];

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  private keycloak = inject(Keycloak);

  navItems: NavigationItem[] = [];
  userRole: string = '';

  ngOnInit(): void {
    this.loadNavigation();
  }

  private loadNavigation(): void {
    const allRoles = (this.keycloak.tokenParsed?.['roles'] as string[]) ?? [];
    const metaRoles = allRoles.filter(r => !ROLES_SYSTEME.includes(r));

    if (metaRoles.includes('chef')) this.userRole = 'chef';
    else if (metaRoles.includes('employe')) this.userRole = 'employe';
    else this.userRole = 'employe';

    this.navItems = this.userRole === 'chef' ? NAV_CHEF : NAV_EMPLOYE;
    console.log('🧭 Navigation chargée pour le rôle:', this.userRole);
  }
}