import { Routes } from '@angular/router';
import { roleRedirectGuard, requireRoleGuard } from './guards/auth.guard';
import { AdminComponent } from './theme/layout/admin/admin.component';

export const routes: Routes = [

  // ── Layout principal ───────────────────────────────
  {
    path: '',
    component: AdminComponent,
    canActivate: [roleRedirectGuard],    // ✅ sur la route parente
    children: []
  },

  // ── Routes protégées ──────────────────────────────
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [requireRoleGuard],
    children: [

      // ═══════════════════════════════════════════
      // EMPLOYÉ
      // ═══════════════════════════════════════════
      {
        path: 'employe/dashboard',
        loadComponent: () => import('./gerai/employe/dashboard-employe')
          .then(m => m.DashboardEmployeComponent),
        data: { roles: ['employe', 'chef', 'rh', 'admin'] }
      },
      {
        path: 'employe/profil',
        loadComponent: () => import('./gerai/employe/profil/profil-employe.component')
          .then(m => m.ProfilEmployeComponent),
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes',
        loadComponent: () => import('./gerai/employe/demandes/liste-demandes/liste-demandes.component')
          .then(m => m.ListeDemandesComponent),
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes/deposer',
        loadComponent: () => import('./gerai/employe/demandes/deposer-demande/deposer-demande.component')
          .then(m => m.DeposerDemandeComponent),
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes/:id',
        loadComponent: () => import('./gerai/employe/demandes/detail-demande/detail-demande.component')
          .then(m => m.DetailDemandeComponent),
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/taches',
        loadComponent: () => import('./gerai/employe/taches/liste-taches.component')
          .then(m => m.ListeTachesComponent),
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/projets',
        loadComponent: () => import('./gerai/employe/projets/liste-projets.component')
          .then(m => m.ListeProjetsComponent),
        data: { roles: ['employe', 'chef', 'admin'] }
      },

      // ═══════════════════════════════════════════
      // CHEF
      // ═══════════════════════════════════════════
      {
        path: 'chef/dashboard',
        loadComponent: () => import('./gerai/chef/dashboard-chef')
          .then(m => m.DashboardChefComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/equipe',
        loadComponent: () => import('./gerai/chef/equipe/equipe.component')
          .then(m => m.EquipeComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/equipe/:id',
        loadComponent: () => import('./gerai/chef/equipe-detail/equipe-detail.component')
          .then(m => m.EquipeDetailComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/equipe/:id/demandes',
        loadComponent: () => import('./gerai/chef/demandes/demandes.component')
          .then(m => m.DemandesChefComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/demandes',
        loadComponent: () => import('./gerai/chef/demandes/demandes.component')
          .then(m => m.DemandesChefComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/taches',
        loadComponent: () => import('./gerai/chef/taches/affectation-taches.component')
          .then(m => m.AffectationTachesComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/projets',
        loadComponent: () => import('./gerai/chef/projets/projets.component')
          .then(m => m.ProjetsComponent),
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/rapports',
        loadComponent: () => import('./gerai/chef/rapports/rapports.component')
          .then(m => m.RapportsComponent),
        data: { roles: ['chef', 'admin'] }
      },

      // ═══════════════════════════════════════════
      // COMMUN
      // ═══════════════════════════════════════════
      {
        path: 'chat',
        loadComponent: () => import('./gerai/chef/chat/chat.component')
          .then(m => m.ChatComponent),
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'notifications',
        loadComponent: () => import('./gerai/chef/notifications/notifications.component')
          .then(m => m.NotificationsComponent),
        data: { roles: ['employe', 'chef', 'admin'] }
      },

      // ═══════════════════════════════════════════
      // ACCÈS REFUSÉ
      // ═══════════════════════════════════════════
      {
        path: 'access-denied',
        loadComponent: () => import('./demo/pages/authentication/login/login.component')
          .then(m => m.LoginComponent)
      }
    ]
  },

  // ── Wildcard ──────────────────────────────────────
  {
    path: '**',
    redirectTo: ''
  }
];