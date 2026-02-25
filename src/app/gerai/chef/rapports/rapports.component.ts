import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';

export interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

export interface RapportRow {
  [key: string]: string | number;
}

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, SharedModule, BreadcrumbComponent],
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss']
})
export class RapportsComponent {

  activeTab: 'CONGES' | 'FORMATIONS' | 'PROJETS' | 'PERFORMANCE' = 'CONGES';
  isExporting = false;

  tabs = [
    { value: 'CONGES',      label: 'Congés',      icon: 'ti ti-calendar-off'   },
    { value: 'FORMATIONS',  label: 'Formations',  icon: 'ti ti-school'          },
    { value: 'PROJETS',     label: 'Projets',     icon: 'ti ti-layout-kanban'   },
    { value: 'PERFORMANCE', label: 'Performance', icon: 'ti ti-chart-bar'       }
  ];

  switchTab(tab: 'CONGES' | 'FORMATIONS' | 'PROJETS' | 'PERFORMANCE'): void {
    this.activeTab = tab;
  }

  // ── CONGÉS ────────────────────────────────────────────
  congesStats: StatCard[] = [
    { label: 'En attente',    value: 5,  icon: 'ti ti-clock',        color: '#FFB64D', trend: '+2 cette semaine',  trendUp: false },
    { label: 'Validés',       value: 12, icon: 'ti ti-circle-check', color: '#2ed8b6', trend: '+3 ce mois',        trendUp: true  },
    { label: 'Refusés',       value: 3,  icon: 'ti ti-circle-x',     color: '#ff5370', trend: 'Stable',            trendUp: false },
    { label: 'Jours posés',   value: 47, icon: 'ti ti-calendar',     color: '#4680FF', trend: 'Sur 30 jours',      trendUp: true  }
  ];

  congesRows: RapportRow[] = [
    { employe: 'Sami Ben Ali',    type: 'Congé annuel', debut: '01/03/2025', fin: '05/03/2025', jours: 5, statut: 'Validé'    },
    { employe: 'Ines Trabelsi',   type: 'Congé maladie',debut: '10/02/2025', fin: '12/02/2025', jours: 3, statut: 'Validé'    },
    { employe: 'Mohamed Gharbi',  type: 'Congé annuel', debut: '15/03/2025', fin: '20/03/2025', jours: 6, statut: 'En attente'},
    { employe: 'Leila Sassi',     type: 'RTT',          debut: '08/03/2025', fin: '08/03/2025', jours: 1, statut: 'Validé'    },
    { employe: 'Youssef Hammami', type: 'Congé annuel', debut: '22/03/2025', fin: '28/03/2025', jours: 7, statut: 'En attente'}
  ];

  // ── FORMATIONS ────────────────────────────────────────
  formationsStats: StatCard[] = [
    { label: 'Demandes soumises', value: 8,   icon: 'ti ti-file-text',   color: '#4680FF', trend: '+4 ce trimestre', trendUp: true  },
    { label: 'En cours',          value: 3,   icon: 'ti ti-player-play', color: '#FFB64D', trend: '3 actives',       trendUp: true  },
    { label: 'Complétées',        value: 11,  icon: 'ti ti-trophy',      color: '#2ed8b6', trend: '+5 ce mois',      trendUp: true  },
    { label: 'Budget utilisé',    value: '68%',icon: 'ti ti-coin',       color: '#ff5370', trend: '34k / 50k DT',    trendUp: false }
  ];

  formationsRows: RapportRow[] = [
    { employe: 'Sami Ben Ali',    formation: 'Angular Avancé',     duree: '3j', cout: '1200 DT', statut: 'Complétée'   },
    { employe: 'Mohamed Gharbi',  formation: 'Power BI',           duree: '2j', cout: '900 DT',  statut: 'En cours'    },
    { employe: 'Ines Trabelsi',   formation: 'UX Research',        duree: '5j', cout: '2100 DT', statut: 'Complétée'   },
    { employe: 'Youssef Hammami', formation: 'DevOps & Kubernetes',duree: '4j', cout: '1800 DT', statut: 'En attente'  },
    { employe: 'Leila Sassi',     formation: 'Cypress Testing',    duree: '2j', cout: '850 DT',  statut: 'En cours'    }
  ];

  // ── PROJETS ───────────────────────────────────────────
  projetsStats: StatCard[] = [
    { label: 'Total projets',   value: 5,    icon: 'ti ti-briefcase',    color: '#4680FF', trend: '2 nouveaux',       trendUp: true  },
    { label: 'En cours',        value: 2,    icon: 'ti ti-loader',       color: '#FFB64D', trend: 'Actifs',           trendUp: true  },
    { label: 'Terminés',        value: 1,    icon: 'ti ti-circle-check', color: '#2ed8b6', trend: '100% livré',       trendUp: true  },
    { label: 'En retard',       value: 1,    icon: 'ti ti-alert-triangle',color: '#ff5370',trend: 'Action requise',   trendUp: false }
  ];

  projetsRows: RapportRow[] = [
    { projet: 'Refonte Système RH',        chef: 'Ahmed Mansour', equipe: 3, progression: '65%', statut: 'En cours'    },
    { projet: 'Application Mobile',         chef: 'Ahmed Mansour', equipe: 2, progression: '40%', statut: 'En cours'    },
    { projet: 'Portail Fournisseurs',        chef: 'Ahmed Mansour', equipe: 3, progression: '100%',statut: 'Terminé'     },
    { projet: 'Tableau de Bord Analytics',  chef: 'Ahmed Mansour', equipe: 2, progression: '20%', statut: 'En retard'   },
    { projet: 'Formation IA',               chef: 'Ahmed Mansour', equipe: 5, progression: '0%',  statut: 'En attente'  }
  ];

  // ── PERFORMANCE ───────────────────────────────────────
  performanceStats: StatCard[] = [
    { label: 'Score moyen équipe', value: '82%', icon: 'ti ti-star',         color: '#4680FF', trend: '+4% vs mois dernier', trendUp: true  },
    { label: 'Tâches complétées',  value: 47,    icon: 'ti ti-checkbox',     color: '#2ed8b6', trend: 'Ce mois',             trendUp: true  },
    { label: 'Taux ponctualité',   value: '91%', icon: 'ti ti-clock-check',  color: '#FFB64D', trend: '+2% vs mois dernier', trendUp: true  },
    { label: 'Absences injustifiées',value: 2,   icon: 'ti ti-user-off',     color: '#ff5370', trend: '-1 vs mois dernier',  trendUp: true  }
  ];

  performanceRows: RapportRow[] = [
    { employe: 'Sami Ben Ali',    taches: 14, ponctualite: '95%', score: '88%', appreciation: 'Excellent'  },
    { employe: 'Ines Trabelsi',   taches: 11, ponctualite: '90%', score: '84%', appreciation: 'Très bien'  },
    { employe: 'Mohamed Gharbi',  taches: 9,  ponctualite: '88%', score: '79%', appreciation: 'Bien'       },
    { employe: 'Leila Sassi',     taches: 7,  ponctualite: '92%', score: '81%', appreciation: 'Très bien'  },
    { employe: 'Youssef Hammami', taches: 6,  ponctualite: '85%', score: '76%', appreciation: 'Bien'       }
  ];

  // ── Getters par onglet ─────────────────────────────────
  get currentStats(): StatCard[] {
    const map = {
      CONGES: this.congesStats,
      FORMATIONS: this.formationsStats,
      PROJETS: this.projetsStats,
      PERFORMANCE: this.performanceStats
    };
    return map[this.activeTab];
  }

  get currentRows(): RapportRow[] {
    const map = {
      CONGES: this.congesRows,
      FORMATIONS: this.formationsRows,
      PROJETS: this.projetsRows,
      PERFORMANCE: this.performanceRows
    };
    return map[this.activeTab];
  }

  get currentColumns(): string[] {
    const map: Record<string, string[]> = {
      CONGES:      ['employe', 'type', 'debut', 'fin', 'jours', 'statut'],
      FORMATIONS:  ['employe', 'formation', 'duree', 'cout', 'statut'],
      PROJETS:     ['projet', 'chef', 'equipe', 'progression', 'statut'],
      PERFORMANCE: ['employe', 'taches', 'ponctualite', 'score', 'appreciation']
    };
    return map[this.activeTab];
  }

  get columnLabels(): Record<string, string> {
    return {
      employe: 'Employé', type: 'Type', debut: 'Début', fin: 'Fin',
      jours: 'Jours', statut: 'Statut', formation: 'Formation',
      duree: 'Durée', cout: 'Coût', projet: 'Projet', chef: 'Chef',
      equipe: 'Équipe', progression: 'Progression', taches: 'Tâches',
      ponctualite: 'Ponctualité', score: 'Score', appreciation: 'Appréciation'
    };
  }

  statutClass(val: string | number): string {
    const s = String(val);
    if (s === 'Validé' || s === 'Complétée' || s === 'Terminé' || s === 'Excellent') return 'badge-success';
    if (s === 'En cours' || s === 'Très bien') return 'badge-primary';
    if (s === 'En attente' || s === 'Bien')    return 'badge-warning';
    if (s === 'Refusé' || s === 'En retard')   return 'badge-danger';
    return '';
  }

  get currentTabLabel(): string {
    return this.tabs.find(t => t.value === this.activeTab)?.label ?? '';
  }

  // ── Export PDF (prêt pour Jasper) ─────────────────────
  exportPdf(): void {
    this.isExporting = true;
    const url = `/api/rapports/${this.activeTab.toLowerCase()}`;
    fetch(url, { method: 'GET' })
      .then(res => {
        if (!res.ok) throw new Error('Export indisponible');
        return res.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `rapport-${this.activeTab.toLowerCase()}.pdf`;
        link.click();
      })
      .catch(() => {
        alert('Export PDF disponible après connexion au backend Jasper Reports.');
      })
      .finally(() => { this.isExporting = false; });
  }
}