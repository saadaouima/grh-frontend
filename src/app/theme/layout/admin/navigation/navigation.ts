export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  role?: string[];
  isMainParent?: boolean;
}

// ═══════════════════════════════════════════════════
// 👤 MENU EMPLOYÉ
// ═══════════════════════════════════════════════════
export const NAV_EMPLOYE: NavigationItem[] = [
  {
    id: 'gerai-employe',
    title: 'GERAI',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard-employe',
        title: 'Mon Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/dashboard',
        icon: 'ti ti-layout-dashboard',
        breadcrumbs: false
      },
      {
        id: 'mon-profil',
        title: 'Mon Profil',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/profil',
        icon: 'ti ti-user',
        breadcrumbs: false
      },
      {
        id: 'mes-demandes',
        title: 'Mes Demandes',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/demandes',
        icon: 'ti ti-file-text',
        breadcrumbs: false
      },
      {
        id: 'mes-taches',
        title: 'Mes Tâches',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/taches',
        icon: 'ti ti-checklist',
        breadcrumbs: false
      },
      {
        id: 'mes-projets',
        title: 'Mes Projets',
        type: 'item',
        classes: 'nav-item',
        url: '/employe/projets',
        icon: 'ti ti-briefcase',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'communication-employe',
    title: 'COMMUNICATION',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'chat-employe',
        title: 'Chat',
        type: 'item',
        classes: 'nav-item',
        url: '/chat',
        icon: 'ti ti-message-circle',
        breadcrumbs: false
      },
      {
        id: 'notifications-employe',
        title: 'Notifications',
        type: 'item',
        classes: 'nav-item',
        url: '/notifications',
        icon: 'ti ti-bell',
        breadcrumbs: false
      }
    ]
  }
];

// ═══════════════════════════════════════════════════
// 🏢 MENU CHEF
// ═══════════════════════════════════════════════════
export const NAV_CHEF: NavigationItem[] = [
  {
    id: 'gerai-chef',
    title: 'GERAI',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard-chef',
        title: 'Mon Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/dashboard',
        icon: 'ti ti-layout-dashboard',
        breadcrumbs: false
      },
      {
        id: 'mon-equipe',
        title: 'Mon Équipe',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/equipe',
        icon: 'ti ti-users',
        breadcrumbs: false
      },
      {
        id: 'valider-demandes',
        title: 'Demandes',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/demandes',
        icon: 'ti ti-clipboard-check',
        breadcrumbs: false
      },
      {
        id: 'liste-taches',
        title: 'Affectation des Tâches',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/taches',
        icon: 'ti ti-subtask',
        breadcrumbs: false
      },
      {
        id: 'liste-projets',
        title: 'Projets',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/projets',
        icon: 'ti ti-layout-kanban',
        breadcrumbs: false
      },
      {
        id: 'rapports-chef',
        title: 'Rapports',
        type: 'item',
        classes: 'nav-item',
        url: '/chef/rapports',
        icon: 'ti ti-chart-dots',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'communication-chef',
    title: 'COMMUNICATION',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'chat-chef',
        title: 'Chat équipe',
        type: 'item',
        classes: 'nav-item',
        url: '/chat',
        icon: 'ti ti-message-circle',
        breadcrumbs: false
      },
      {
        id: 'notifications-chef',
        title: 'Notifications',
        type: 'item',
        classes: 'nav-item',
        url: '/notifications',
        icon: 'ti ti-bell',
        breadcrumbs: false
      }
    ]
  }
];

// ═══════════════════════════════════════════════════
// 📦 Export combiné (fallback Berry)
// ═══════════════════════════════════════════════════
export const NavigationItems: NavigationItem[] = [
  ...NAV_EMPLOYE,
  ...NAV_CHEF
];