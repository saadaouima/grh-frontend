import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { EquipeApiService } from '../../services/equipe-api.service';
import { MembreEquipe } from '../../models/equipe.models';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [CommonModule, SharedModule, CardComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.scss']
})
export class EquipeComponent implements OnInit {

  constructor(private cd: ChangeDetectorRef) {}

  private router      = inject(Router);
  private fb          = inject(FormBuilder);
  private equipeApiService = inject(EquipeApiService);

  showModal = false;
  membres: MembreEquipe[] = [];
  loading = false;
  error: string | null = null;

  form = this.fb.group({
    prenom: ['', Validators.required],
    nom:    ['', Validators.required],
    poste:  ['', Validators.required],
    email:  ['', [Validators.required, Validators.email]],
    statut: ['ACTIF', Validators.required]
  });

  ngOnInit(): void {
    this.chargerMembres();
  }

  chargerMembres(): void {
    this.loading = true;
    this.error = null;

    this.equipeApiService.getMembres().subscribe({

      next: (data) => {
        this.membres = data;
        this.loading = false;
        this.cd.detectChanges(); // tells Angular to re-check safely
      },
      error: () => {
        this.error = 'Erreur lors du chargement de l\'équipe';
        this.loading = false;
      }
    });
  }

  ouvrirModal(): void { this.showModal = true; }
  fermerModal(): void { this.showModal = false; this.form.reset({ statut: 'ACTIF' }); }

  ajouterMembre(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const payload = {
      prenom: this.form.value.prenom!,
      nom:    this.form.value.nom!,
      poste:  this.form.value.poste!,
      email:  this.form.value.email!,
      statut: this.form.value.statut as 'ACTIF' | 'CONGE'
    };

    // ✅ Use the correct service method name
    this.equipeApiService.ajouterMembre(payload).subscribe({
      next: (newMembre) => {
        this.membres.push(newMembre);
        this.fermerModal();
      },
      error: () => {
        this.error = 'Erreur lors de l\'ajout';
      }
    });
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