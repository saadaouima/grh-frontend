import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

export interface MembreEquipe {
  id: number;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
  statut: 'ACTIF' | 'CONGE';
}

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    CardComponent  // ✅ Import manquant pour app-card
  ],
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.scss']
})
export class EquipeComponent {

  private router = inject(Router);

  membres: MembreEquipe[] = [
    {
      id: 1,
      nom: 'Ben Ali',
      prenom: 'Sami',
      poste: 'Développeur Backend',
      email: 'sami.benali@gerai.tn',
      statut: 'ACTIF'
    },
    {
      id: 2,
      nom: 'Trabelsi',
      prenom: 'Ines',
      poste: 'Analyste BI',
      email: 'ines.trabelsi@gerai.tn',
      statut: 'CONGE'
    },
    {
      id: 3,
      nom: 'Karray',
      prenom: 'Youssef',
      poste: 'Chef de projet',
      email: 'youssef.karray@gerai.tn',
      statut: 'ACTIF'
    }
  ];

  // 🔵 Bouton PROFIL - paramètre corrigé (objet membre au lieu de nombre)
  voirProfil(membre: MembreEquipe): void {
    this.router.navigate(['/chef/equipe', membre.id]);

    /*
      🔜 API Spring Boot (plus tard)
      GET /api/employes/{id}
      → retourne les infos détaillées de l'employé
    */
  }

  // 🟣 Bouton DEMANDES - paramètre corrigé
  voirDemandes(membre: MembreEquipe): void {
    this.router.navigate(['/chef/demandes'], {
      queryParams: { employeId: membre.id }
    });

    /*
      🔜 API Spring Boot (plus tard)
      GET /api/demandes?employeId={id}
      → retourne les demandes de cet employé
    */
  }
}