import { Component, OnInit, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavigationItem, NAV_CHEF, NAV_EMPLOYE } from '../../navigation/navigation';

@Component({
  selector: 'app-nav-left',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent implements OnInit {

  private keycloakService = inject(KeycloakService);

  // Output vers nav-bar pour fermer le menu mobile
  NavCollapsedMob = output();

  // Menu chargé selon le rôle
  navigationItems: NavigationItem[] = [];
  userRole: 'chef' | 'employe' | null = null;

  ngOnInit(): void {
    this.loadMenuByRole();
  }

  loadMenuByRole(): void {
    const roles = this.keycloakService.getUserRoles();

    if (roles.includes('chef') || roles.includes('CHEF')) {
      this.userRole = 'chef';
      this.navigationItems = NAV_CHEF;
    } else if (roles.includes('employe') || roles.includes('EMPLOYE')) {
      this.userRole = 'employe';
      this.navigationItems = NAV_EMPLOYE;
    } else {
      // Fallback : employé par défaut
      this.userRole = 'employe';
      this.navigationItems = NAV_EMPLOYE;
    }
  }

  navCollapsedMob(): void {
    this.NavCollapsedMob.emit();
  }

  logout(): void {
    this.keycloakService.logout(window.location.origin);
  }
}