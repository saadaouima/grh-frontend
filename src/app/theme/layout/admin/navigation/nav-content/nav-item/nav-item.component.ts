// Angular import
import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Project import
import { NavigationItem } from '../../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LayoutStateService } from 'src/app/theme/shared/service/layout-state.service';

// Keycloak
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent {
  // public props
  item = input.required<NavigationItem>();
  private layoutState = inject(LayoutStateService);
  private keycloakService = inject(KeycloakService);

  // Méthode pour gérer le clic sur un item
  handleClick(event: MouseEvent) {
    // ── Si c'est le bouton logout, déconnecter ──
    if (this.item().id === 'logout') {
      event.preventDefault();
      this.keycloakService.logout(window.location.origin);
      return;
    }

    // Fermer le menu mobile si ouvert
    const nav = document.querySelector('app-navigation.pc-navbar') as HTMLDivElement;
    if (nav?.classList.contains('mob-open')) {
      nav.classList.remove('mob-open');
    }
  }
}
