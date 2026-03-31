import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

export interface DemandeChef {
  id: number;
  employeId: number;
  employeNom: string;
  type: string;
  dateDemande: Date;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
  statutLabel: string;
}

@Component({
  selector: 'app-demandes-chef',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent],
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.scss']
})
export class DemandesChefComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  employeIdFiltre: number | null = null;
  employeNomFiltre: string = '';

  toutesLesDemandes: DemandeChef[] = [
    { id: 1, employeId: 1, employeNom: 'Sami Ben Ali', type: 'Congé', dateDemande: new Date('2024-02-15'), statut: 'EN_ATTENTE', statutLabel: 'En attente' },
    { id: 2, employeId: 1, employeNom: 'Sami Ben Ali', type: 'Formation', dateDemande: new Date('2024-02-10'), statut: 'VALIDEE', statutLabel: 'Validée' },
    { id: 3, employeId: 2, employeNom: 'Ines Trabelsi', type: 'Document', dateDemande: new Date('2024-02-05'), statut: 'REFUSEE', statutLabel: 'Refusée' },
    { id: 4, employeId: 2, employeNom: 'Ines Trabelsi', type: 'Congé', dateDemande: new Date('2024-01-28'), statut: 'VALIDEE', statutLabel: 'Validée' },
    { id: 5, employeId: 3, employeNom: 'Youssef Karray', type: 'Congé', dateDemande: new Date('2024-01-15'), statut: 'EN_ATTENTE', statutLabel: 'En attente' },
  ];

  demandesFiltrees: DemandeChef[] = [];

  ngOnInit(): void {
    // ✅ Récupère l'employeId depuis les queryParams
    this.route.queryParams.subscribe(params => {
      this.employeIdFiltre = params['employeId'] ? Number(params['employeId']) : null;
      this.appliquerFiltre();
    });
  }

  appliquerFiltre(): void {
    if (this.employeIdFiltre !== null) {
      this.demandesFiltrees = this.toutesLesDemandes
        .filter(d => d.employeId === this.employeIdFiltre);
      const premier = this.demandesFiltrees[0];
      this.employeNomFiltre = premier ? premier.employeNom : '';
    } else {
      this.demandesFiltrees = [...this.toutesLesDemandes];
      this.employeNomFiltre = '';
    }
  }

  voirToutesDemandes(): void {
    this.router.navigate(['/chef/demandes']);
  }

  valider(id: number): void {
    const d = this.toutesLesDemandes.find(d => d.id === id);
    if (d) { d.statut = 'VALIDEE'; d.statutLabel = 'Validée'; }
    this.appliquerFiltre();
  }

  refuser(id: number): void {
    const d = this.toutesLesDemandes.find(d => d.id === id);
    if (d) { d.statut = 'REFUSEE'; d.statutLabel = 'Refusée'; }
    this.appliquerFiltre();
  }
}