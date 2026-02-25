import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { CardComponent }       from 'src/app/theme/shared/components/card/card.component';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { Demande }             from 'src/app/theme/shared/interfaces/demande';

@Component({
  selector: 'app-demandes-chef',
  standalone: true,
  imports: [CommonModule, SharedModule, DatePipe, CardComponent, BreadcrumbComponent],
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.scss']
})
export class DemandesChefComponent implements OnInit {

  activeTab: 'A_VALIDER' | 'HISTORIQUE' = 'A_VALIDER';
  demandes: Demande[] = [];

  ngOnInit(): void {
    this.loadDemandes();
  }

  // Toutes les demandes de l'équipe — plus de filtre par employeId
  loadDemandes(): void {
    this.demandes = [
      {
        id: 1, employeId: 1,
        type: 'Congé',
        statut: 'EN_ATTENTE', statutLabel: 'EN ATTENTE',
        statusColor: 'text-warning', bgColor: 'bg-light-warning',
        icon: 'ti ti-calendar-off',
        date: '2025-02-15',
        dateDemande: new Date('2025-02-15'),
        dateDebut: new Date('2025-03-01'),
        dateFin: new Date('2025-03-05'),
        employe: 'Sami Ben Ali'
      },
      {
        id: 2, employeId: 2,
        type: 'Formation',
        statut: 'EN_ATTENTE', statutLabel: 'À VALIDER',
        statusColor: 'text-warning', bgColor: 'bg-light-warning',
        icon: 'ti ti-school',
        date: '2025-02-10',
        dateDemande: new Date('2025-02-10'),
        dateDebut: new Date('2025-04-04'),
        dateFin: new Date('2025-04-08'),
        employe: 'Ines Trabelsi'
      },
      {
        id: 3, employeId: 3,
        type: 'Congé',
        statut: 'EN_ATTENTE', statutLabel: 'EN ATTENTE',
        statusColor: 'text-warning', bgColor: 'bg-light-warning',
        icon: 'ti ti-calendar-off',
        date: '2025-02-18',
        dateDemande: new Date('2025-02-18'),
        dateDebut: new Date('2025-03-10'),
        dateFin: new Date('2025-03-14'),
        employe: 'Mohamed Gharbi'
      },
      {
        id: 4, employeId: 1,
        type: 'Document',
        statut: 'VALIDEE', statutLabel: 'APPROUVÉ',
        statusColor: 'text-success', bgColor: 'bg-light-success',
        icon: 'ti ti-file-check',
        date: '2025-01-20',
        dateDemande: new Date('2025-01-20'),
        dateDebut: null, dateFin: null,
        validePar: 'Ahmed Mansour',
        employe: 'Sami Ben Ali'
      },
      {
        id: 5, employeId: 4,
        type: 'Formation',
        statut: 'REFUSEE', statutLabel: 'REFUSÉ',
        statusColor: 'text-danger', bgColor: 'bg-light-danger',
        icon: 'ti ti-school',
        date: '2025-01-15',
        dateDemande: new Date('2025-01-15'),
        dateDebut: new Date('2025-02-01'),
        dateFin: new Date('2025-02-05'),
        validePar: 'Ahmed Mansour',
        employe: 'Leila Sassi'
      }
    ];
  }

  switchTab(tab: 'A_VALIDER' | 'HISTORIQUE'): void {
    this.activeTab = tab;
  }

  get demandesATraiter(): Demande[] {
    return this.demandes.filter(d => d.statut === 'EN_ATTENTE');
  }

  get historique(): Demande[] {
    return this.demandes.filter(d => d.statut !== 'EN_ATTENTE');
  }

  valider(d: Demande): void {
    d.statut      = 'VALIDEE';
    d.statutLabel = 'APPROUVÉ';
    d.statusColor = 'text-success';
    d.bgColor     = 'bg-light-success';
    d.validePar   = 'Ahmed Mansour';
  }

  refuser(d: Demande): void {
    d.statut      = 'REFUSEE';
    d.statutLabel = 'REFUSÉ';
    d.statusColor = 'text-danger';
    d.bgColor     = 'bg-light-danger';
    d.validePar   = 'Ahmed Mansour';
  }
}