import { Component, OnInit, output, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import Keycloak from 'keycloak-js';

import { environment } from 'src/environments/environment';
import { NavigationItem, NAV_CHEF, NAV_EMPLOYE } from '../navigation';
import { NavCollapseComponent } from './nav-collapse/nav-collapse.component';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { NavItemComponent } from './nav-item/nav-item.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

const ROLES_SYSTEME = [
  'offline_access', 'uma_authorization', 'manage-account',
  'manage-account-links', 'view-profile', 'default-roles-gerai',
  'default-roles-master', 'create-realm', 'broker'
];

@Component({
  selector: 'app-nav-content',
  imports: [RouterModule, NavCollapseComponent, NavGroupComponent, NavItemComponent, SharedModule],
  templateUrl: './nav-content.component.html',
  styleUrl: './nav-content.component.scss'
})
export class NavContentComponent implements OnInit {

  private location = inject(Location);
  private keycloak = inject(Keycloak);

  NavCollapsedMob = output();
  SubmenuCollapse = output();

  currentApplicationVersion = environment.appVersion;
  navigations: NavigationItem[] = [];
  windowWidth: number;

  constructor() {
    this.windowWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.loadNavigationByRole();

    if (this.windowWidth < 1025) {
      setTimeout(() => {
        (document.querySelector('.coded-navbar') as HTMLDivElement)
          ?.classList.add('menupos-static');
      }, 500);
    }
  }

  private loadNavigationByRole(): void {
    const allRoles = (this.keycloak.tokenParsed?.['roles'] as string[]) ?? [];
    const metaRoles = allRoles.filter(r => !ROLES_SYSTEME.includes(r));

    if (metaRoles.includes('chef') || metaRoles.includes('CHEF')) {
      this.navigations = NAV_CHEF;
      console.log('🏢 Menu CHEF chargé');
    } else {
      this.navigations = NAV_EMPLOYE;
      console.log('👤 Menu EMPLOYÉ chargé');
    }
  }

  fireOutClick(): void {
    let current_url = this.location.path();
    // @ts-ignore
    if (this.location['_baseHref']) {
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) { parent.classList.add('coded-trigger', 'active'); }
      else if (up_parent?.classList.contains('coded-hasmenu')) { up_parent.classList.add('coded-trigger', 'active'); }
      else if (last_parent?.classList.contains('coded-hasmenu')) { last_parent.classList.add('coded-trigger', 'active'); }
    }
  }
}