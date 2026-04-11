import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { DemandeService } from  'src/app/gerai/services/demande.service';
import { Demande, StatutDemande } from 'src/app/gerai/models/demande.model';
import { ChangeDetectorRef }   from '@angular/core';

@Component({
  selector: 'app-demandes-chef',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent],
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.scss']
})
export class DemandesChefComponent implements OnInit {
  
  constructor(private cd: ChangeDetectorRef) {}

 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private demandeService = inject(DemandeService);

  employeIdFiltre: string | null = null;
  employeNomFiltre: string = '';
  demandeSelectionnee: Demande | null = null;
  filtreStatut: StatutDemande | '' = '';

  toutesLesDemandes: Demande[] = [];
  demandesFiltrees: Demande[] = [];

  readonly statuts: { valeur: StatutDemande | ''; label: string }[] = [
    { valeur: '',            label: 'Toutes'       },
    { valeur: 'EN_ATTENTE',  label: 'En attente'   },
    { valeur: 'VALIDEE_CHEF',label: 'Validée chef' },
    { valeur: 'VALIDEE_RH',  label: 'Validée RH'   },
    { valeur: 'VALIDEE',     label: 'Validée'      },
    { valeur: 'REJETEE',     label: 'Rejetée'      }
  ];

  ngOnInit(): void {
    // Charger toutes les demandes depuis le service
    this.demandeService.getDemandes().subscribe(demandes => {
      this.toutesLesDemandes = demandes;
      this.appliquerFiltre();
      this.cd.markForCheck();
    });

    this.route.queryParams.subscribe(params => {
      this.employeIdFiltre = params['employeId'] ? String(params['employeId']) : null;
      this.filtreStatut = (params['statut'] as StatutDemande) || '';
      this.appliquerFiltre();
      this.cd.markForCheck();
    });
  }

  appliquerFiltre(): void {
    let demandes = [...this.toutesLesDemandes];

    if (this.employeIdFiltre !== null) {
      demandes = demandes.filter(d => d.employeId === this.employeIdFiltre);
      const premier = demandes[0];
      this.employeNomFiltre = premier ? `${premier.employePrenom} ${premier.employeNom}` : '';
    } else {
      this.employeNomFiltre = '';
    }

    if (this.filtreStatut !== '') {
      demandes = demandes.filter(d => d.statut === this.filtreStatut);
    }

    this.demandesFiltrees = demandes.sort((a, b) =>
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
    );
  }

  setFiltreStatut(statut: StatutDemande | ''): void {
    this.filtreStatut = statut;
    this.appliquerFiltre();
    this.cd.markForCheck();
  }

  countParStatut(statut: StatutDemande | ''): number {
    const base = this.employeIdFiltre
      ? this.toutesLesDemandes.filter(d => d.employeId === this.employeIdFiltre)
      : this.toutesLesDemandes;
    return statut === '' ? base.length : base.filter(d => d.statut === statut).length;
  }


  voirToutesDemandes(): void {
    this.router.navigate(['/chef/demandes']);
  }

  valider(id: number): void {
    this.demandeService.validerDemande(id).subscribe(updated => {
      const index = this.toutesLesDemandes.findIndex(d => d.id === id);
      if (index !== -1) {
        this.toutesLesDemandes[index] = updated;
        this.appliquerFiltre();
      }
    });
  }

  refuser(id: number): void {
    const motif = 'Motif de refus simulé';
    this.demandeService.refuserDemande(id, motif).subscribe(updated => {
      const index = this.toutesLesDemandes.findIndex(d => d.id === id);
      if (index !== -1) {
        this.toutesLesDemandes[index] = updated;
        this.appliquerFiltre();
      }
    });
  }

  voirDemande(demande: Demande): void {
    this.router.navigate(['/chef/demandes', demande.id]);
  }

}