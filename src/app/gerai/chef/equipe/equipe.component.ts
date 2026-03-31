import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
  imports: [CommonModule, SharedModule, CardComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.scss']
})
export class EquipeComponent {

  private router = inject(Router);
  private fb = inject(FormBuilder);

  showModal = false;

  membres: MembreEquipe[] = [
    { id: 1, nom: 'Ben Ali', prenom: 'Sami', poste: 'Développeur Backend', email: 'sami.benali@gerai.tn', statut: 'ACTIF' },
    { id: 2, nom: 'Trabelsi', prenom: 'Ines', poste: 'Analyste BI', email: 'ines.trabelsi@gerai.tn', statut: 'CONGE' },
    { id: 3, nom: 'Karray', prenom: 'Youssef', poste: 'Chef de projet', email: 'youssef.karray@gerai.tn', statut: 'ACTIF' }
  ];

  form = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    poste: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    statut: ['ACTIF', Validators.required]
  });

  ouvrirModal(): void { this.showModal = true; }
  fermerModal(): void { this.showModal = false; this.form.reset({ statut: 'ACTIF' }); }

  ajouterMembre(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const newId = Math.max(...this.membres.map(m => m.id)) + 1;
    this.membres.push({
      id: newId,
      prenom: this.form.value.prenom!,
      nom: this.form.value.nom!,
      poste: this.form.value.poste!,
      email: this.form.value.email!,
      statut: this.form.value.statut as 'ACTIF' | 'CONGE'
    });

    this.fermerModal();
  }

  voirProfil(membre: MembreEquipe): void {
    this.router.navigate(['/chef/equipe', membre.id]);
  }

  voirDemandes(membre: MembreEquipe): void {
    this.router.navigate(['/chef/demandes'], {
      queryParams: { employeId: membre.id }
    });
  }
}