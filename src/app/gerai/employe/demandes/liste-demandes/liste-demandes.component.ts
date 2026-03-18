// Angular Import
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

export interface DemandeDetail {
  id: number;
  type: string;
  dateDemande: Date;
  dateDebut: Date | null;
  dateFin: Date | null;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
  statutLabel: string;
  statutIcon: string;
  statusColor: string;
  bgColor: string;
  icon: string;
  iconColor: string;
  validePar: string | null;
}

@Component({
  selector: 'app-liste-demandes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CardComponent
  ],
  templateUrl: './liste-demandes.component.html',
  styleUrls: ['./liste-demandes.component.scss']
})
export class ListeDemandesComponent implements OnInit {

  private router = inject(Router);

  demandes: DemandeDetail[] = [];
  demandesFiltrees: DemandeDetail[] = [];

  totalDemandes = 0;
  enAttente = 0;
  validees = 0;
  refusees = 0;

  searchTerm = '';
  selectedType = '';
  selectedStatut = '';

  sortColumn = 'dateDemande';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    // ✅ Chargement direct — suppression du setTimeout inutile
    this.demandes = [
      {
        id: 1, type: 'Congé', dateDemande: new Date('2024-02-15'),
        dateDebut: new Date('2024-03-01'), dateFin: new Date('2024-03-10'),
        statut: 'EN_ATTENTE', statutLabel: 'En attente', statutIcon: 'ti-clock',
        statusColor: 'text-warning', bgColor: 'bg-light-warning',
        icon: 'ti-beach', iconColor: 'text-primary', validePar: null
      },
      {
        id: 2, type: 'Formation', dateDemande: new Date('2024-02-10'),
        dateDebut: new Date('2024-02-20'), dateFin: new Date('2024-02-22'),
        statut: 'VALIDEE', statutLabel: 'Validée', statutIcon: 'ti-check',
        statusColor: 'text-success', bgColor: 'bg-light-success',
        icon: 'ti-school', iconColor: 'text-success', validePar: 'Marie Dupont'
      },
      {
        id: 3, type: 'Document', dateDemande: new Date('2024-02-05'),
        dateDebut: null, dateFin: null,
        statut: 'VALIDEE', statutLabel: 'Validée', statutIcon: 'ti-check',
        statusColor: 'text-success', bgColor: 'bg-light-success',
        icon: 'ti-file-text', iconColor: 'text-info', validePar: 'Jean Martin'
      },
      {
        id: 4, type: 'Congé', dateDemande: new Date('2024-01-28'),
        dateDebut: new Date('2024-02-05'), dateFin: new Date('2024-02-07'),
        statut: 'REFUSEE', statutLabel: 'Refusée', statutIcon: 'ti-x',
        statusColor: 'text-danger', bgColor: 'bg-light-danger',
        icon: 'ti-beach', iconColor: 'text-primary', validePar: 'Marie Dupont'
      },
      {
        id: 5, type: 'Autre', dateDemande: new Date('2024-01-15'),
        dateDebut: null, dateFin: null,
        statut: 'VALIDEE', statutLabel: 'Validée', statutIcon: 'ti-check',
        statusColor: 'text-success', bgColor: 'bg-light-success',
        icon: 'ti-dots', iconColor: 'text-secondary', validePar: 'Jean Martin'
      }
    ];

    this.calculateStats();
    this.demandesFiltrees = [...this.demandes];
    this.sortBy(this.sortColumn);
    this.updatePagination();
  }

  calculateStats(): void {
    this.totalDemandes = this.demandes.length;
    this.enAttente     = this.demandes.filter(d => d.statut === 'EN_ATTENTE').length;
    this.validees      = this.demandes.filter(d => d.statut === 'VALIDEE').length;
    this.refusees      = this.demandes.filter(d => d.statut === 'REFUSEE').length;
  }

  filterDemandes(): void {
    this.demandesFiltrees = this.demandes.filter(demande => {
      const matchSearch  = !this.searchTerm   ||
        demande.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        demande.id.toString().includes(this.searchTerm);
      const matchType    = !this.selectedType   || demande.type   === this.selectedType;
      const matchStatut  = !this.selectedStatut || demande.statut === this.selectedStatut;
      return matchSearch && matchType && matchStatut;
    });

    this.sortBy(this.sortColumn);
    this.updatePagination();
  }

  resetFilters(): void {
    this.searchTerm     = '';
    this.selectedType   = '';
    this.selectedStatut = '';
    this.filterDemandes();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn    = column;
      this.sortDirection = 'asc';
    }

    this.demandesFiltrees.sort((a, b) => {
      let valueA: string | number | Date | null = a[column as keyof DemandeDetail];
      let valueB: string | number | Date | null = b[column as keyof DemandeDetail];

      if (valueA instanceof Date) valueA = valueA.getTime();
      if (valueB instanceof Date) valueB = valueB.getTime();

      if (valueA == null) return  1;
      if (valueB == null) return -1;
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 :  1;
      if (valueA > valueB) return this.sortDirection === 'asc' ?  1 : -1;
      return 0;
    });
  }

  nouvelleDemande(): void {
    this.router.navigate(['/employe/demandes/deposer']);
  }

  voirDetail(demandeId: number): void {
    this.router.navigate(['/employe/demandes', demandeId]);
  }

  annulerDemande(demandeId: number): void {
    if (confirm('Voulez-vous vraiment annuler cette demande ?')) {
      this.demandes = this.demandes.filter(d => d.id !== demandeId);
      this.filterDemandes();
      this.calculateStats();
    }
  }

  updatePagination(): void {
    this.totalPages  = Math.ceil(this.demandesFiltrees.length / this.pageSize);
    this.currentPage = 1;
  }

  get demandesPage(): DemandeDetail[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.demandesFiltrees.slice(start, start + this.pageSize);
  }

  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage(): void { if (this.currentPage > 1) this.currentPage--; }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }
}