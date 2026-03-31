import { Routes } from '@angular/router';
import { roleRedirectGuard, requireRoleGuard } from './guards/auth.guard';
import { AdminComponent } from './theme/layout/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [roleRedirectGuard],
    component: AdminComponent
  },
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [requireRoleGuard],
    children: [

      // ─── DASHBOARDS ───
      {
        path: 'employe/dashboard',
        loadComponent: () => import('./gerai/employe/dashboard-employe')
          .then(m => m.DashboardEmployeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'chef/dashboard',
        loadComponent: () => import('./gerai/chef/dashboard-chef')
          .then(m => m.DashboardChefComponent),
        data: { roles: ['chef', 'admin'] }
      },

      // ─── PAGES EMPLOYÉ ───
      {
        path: 'employe/profil',
        loadComponent: () => import('./gerai/employe/profil/profil-employe.component')
          .then(m => m.ProfilEmployeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes',
        loadComponent: () => import('./gerai/employe/demandes/liste-demandes/liste-demandes.component')
          .then(m => m.ListeDemandesComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes/deposer',
        loadComponent: () => import('./gerai/employe/demandes/deposer-demande/deposer-demande.component')
          .then(m => m.DeposerDemandeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/demandes/:id',
        loadComponent: () => import('./gerai/employe/demandes/detail-demande/detail-demande.component')
          .then(m => m.DetailDemandeComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/taches',
        loadComponent: () => import('./gerai/employe/taches/liste-taches.component')
          .then(m => m.ListeTachesComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'employe/projets',
        loadComponent: () => import('./gerai/employe/projets/liste-projets.component')
          .then(m => m.ListeProjetsComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },

      // ─── PAGES CHEF ───
      {
        path: 'chef/equipe',
        loadComponent: () => import('./gerai/chef/equipe/equipe.component')
          .then(m => m.EquipeComponent),
        data: { roles: ['chef', 'admin'] }
      },
      // ✅ Profil détaillé d'un employé
      {
        path: 'chef/equipe/:id',
        loadComponent: () => import('./gerai/chef/equipe-detail/equipe-detail.component')
          .then(m => m.EquipeDetailComponent),
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

      // ─── PAGES COMMUNES ───
      {
        path: 'chat',
        loadComponent: () => import('./gerai/chef/chat/chat.component')
          .then(m => m.ChatComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'notifications',
        loadComponent: () => import('./gerai/chef/notifications/notifications.component')
          .then(m => m.NotificationsComponent),
        data: { roles: ['employe', 'employé', 'chef', 'admin'] }
      },
      {
        path: 'access-denied',
        loadComponent: () => import('./demo/pages/authentication/login/login.component')
          .then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];