import { Routes } from '@angular/router';
import { roleRedirectGuard, requireRoleGuard } from './guards/auth.guard';
import { AdminComponent } from './theme/layout/admin/admin.component';

export const routes: Routes = [

  // ── Route racine : redirige selon le rôle ─────────────────────
  {
    path: '',
    canActivate: [roleRedirectGuard],
    component: AdminComponent,
    children: []
  },

  // ── Layout Admin (shell) ──────────────────────────────────────
  {
    path: '',
    component: AdminComponent,
    children: [

      // ═══════════════════════════════════════════
      // EMPLOYÉ
      // ═══════════════════════════════════════════
      {
        path: 'employe/dashboard',
        loadComponent: () => import('./gerai/employe/dashboard-employe')
          .then(m => m.DashboardEmployeComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['employe', 'chef', 'rh', 'admin'] }
      },
      {
        path: 'employe/profil',
        loadComponent: () => import('./gerai/employe/profil/profil-employe.component')
          .then(m => m.ProfilEmployeComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes',
        loadComponent: () => import('./gerai/employe/demandes/liste-demandes/liste-demandes.component')
          .then(m => m.ListeDemandesComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes/deposer',
        loadComponent: () => import('./gerai/employe/demandes/deposer-demande/deposer-demande.component')
          .then(m => m.DeposerDemandeComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes/:id',
        loadComponent: () => import('./gerai/employe/demandes/detail-demande/detail-demande.component')
          .then(m => m.DetailDemandeComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/taches',
        loadComponent: () => import('./gerai/employe/taches/liste-taches.component')
          .then(m => m.ListeTachesComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'employe/projets',
        loadComponent: () => import('./gerai/employe/projets/liste-projets.component')
          .then(m => m.ListeProjetsComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['employe', 'chef', 'admin'] }
      },

      // ═══════════════════════════════════════════
      // CHEF
      // ═══════════════════════════════════════════
      {
        path: 'chef/dashboard',
        loadComponent: () => import('./gerai/chef/dashboard-chef')
          .then(m => m.DashboardChefComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/equipe',
        loadComponent: () => import('./gerai/chef/equipe/equipe.component')
          .then(m => m.EquipeComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/equipe/:id',
        loadComponent: () => import('./gerai/chef/equipe-detail/equipe-detail.component')
          .then(m => m.EquipeDetailComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/equipe/:id/demandes',
        loadComponent: () => import('./gerai/chef/demandes/demandes.component')
          .then(m => m.DemandesChefComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/demandes',
        loadComponent: () => import('./gerai/chef/demandes/demandes.component')
          .then(m => m.DemandesChefComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/taches',
        loadComponent: () => import('./gerai/chef/taches/affectation-taches.component')
          .then(m => m.AffectationTachesComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/projets',
        loadComponent: () => import('./gerai/chef/projets/projets.component')
          .then(m => m.ProjetsComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['chef', 'admin'] }
      },
      {
        path: 'chef/rapports',
        loadComponent: () => import('./gerai/chef/rapports/rapports.component')
          .then(m => m.RapportsComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['chef', 'admin'] }
      },

      // ═══════════════════════════════════════════
      // COMMUN (chef + employé)
      // ═══════════════════════════════════════════
      {
        path: 'chat',
        loadComponent: () => import('./gerai/chef/chat/chat.component')
          .then(m => m.ChatComponent),
        canActivate: [requireRoleGuard],
        data: { roles: ['employe', 'chef', 'admin'] }
      },
      {
        path: 'notifications',
        loadComponent: () => import('./gerai/chef/notifications/notifications.component')
          .then(m => m.NotificationsComponent),
        canActivate: [requireRoleGuard],
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

  // ── Wildcard ──────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: ''
  }
];