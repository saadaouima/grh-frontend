import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { EquipeApiService } from '../../services/equipe-api.service';
import { EmployeService } from '../../services/employe.service';
import { MembreEquipe, CreateMembreDTO } from '../../models/equipe.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [CommonModule, SharedModule, CardComponent, FormsModule],
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.scss']
})
export class EquipeComponent implements OnInit, OnDestroy {

  constructor(private cd: ChangeDetectorRef) {}

  private router           = inject(Router);
  private equipeApiService = inject(EquipeApiService);
  private employeService   = inject(EmployeService);

  // ── Team list ────────────────────────────────────────
  membres: MembreEquipe[] = [];
  loading = false;
  error: string | null = null;

  // ── Profil modal ─────────────────────────────────────
  showProfilModal = false;
  membreSelectionne: MembreEquipe | null = null;

  // ── Add modal ────────────────────────────────────────
  showModal    = false;
  searchQuery  = '';
  searchResults: Employe[] = [];
  searching    = false;
  employeChoisi: Employe | null = null;
  statutAjouter: 'ACTIF' | 'CONGE' | 'INACTIF' = 'ACTIF';
  ajoutError: string | null = null;

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  // ── Lifecycle ────────────────────────────────────────
  ngOnInit(): void {
    this.chargerMembres();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.trim().length < 2) { this.searchResults = []; this.searching = false; return of([]); }
        this.searching = true;
        return this.employeService.searchEmployes(q).pipe(
          catchError(() => { this.searching = false; return of([]); })
        );
      })
    ).subscribe(results => {
      const emails = new Set(this.membres.map(m => m.email));
      this.searchResults = results.filter(e => !emails.has(e.email));
      this.searching = false;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  // ── Team loading ─────────────────────────────────────
  chargerMembres(): void {
    this.loading = true;
    this.error = null;
    this.equipeApiService.getMembres().subscribe({
      next: data => { this.membres = data; this.loading = false; this.cd.detectChanges(); },
      error: ()   => { this.error = 'Erreur lors du chargement de l\'équipe'; this.loading = false; }
    });
  }

  // ── Add modal ────────────────────────────────────────
  ouvrirModal(): void {
    this.showModal     = true;
    this.searchQuery   = '';
    this.searchResults = [];
    this.employeChoisi = null;
    this.statutAjouter = 'ACTIF';
    this.ajoutError    = null;
  }

  fermerModal(): void {
    this.showModal     = false;
    this.searchQuery   = '';
    this.searchResults = [];
    this.employeChoisi = null;
    this.ajoutError    = null;
  }

  onSearchChange(): void {
    this.employeChoisi = null;
    this.searchSubject.next(this.searchQuery);
  }

  selectionnerEmploye(e: Employe): void {
    this.employeChoisi  = e;
    this.searchQuery    = `${e.prenom} ${e.nom}`;
    this.searchResults  = [];
  }

  reinitialiserRecherche(): void {
    this.employeChoisi = null;
    this.searchQuery   = '';
    this.searchResults = [];
  }

  confirmerAjout(): void {
    if (!this.employeChoisi) return;
    this.ajoutError = null;
    const e = this.employeChoisi;

    const payload: CreateMembreDTO = {
      prenom:       e.prenom,
      nom:          e.nom,
      poste:        e.poste ?? '',
      email:        e.email,
      photo:        e.photo,
      telephone:    e.telephone,
      departement:  e.departement,
      statut:       this.statutAjouter
    };

    this.equipeApiService.ajouterMembre(payload).subscribe({
      next: newMembre => { this.membres.push(newMembre); this.fermerModal(); this.cd.detectChanges(); },
      error: ()       => { this.ajoutError = 'Erreur lors de l\'ajout. Veuillez réessayer.'; }
    });
  }

  // ── Profil modal ─────────────────────────────────────
  ouvrirProfilModal(membre: MembreEquipe): void {
    this.membreSelectionne = membre;
    this.showProfilModal   = true;
  }

  fermerProfilModal(): void {
    this.showProfilModal   = false;
    this.membreSelectionne = null;
  }

  // ── Navigation ───────────────────────────────────────
  voirDemandes(membre: MembreEquipe): void {
    this.router.navigate(['/chef/demandes'], {
      queryParams: { employeId: membre.keycloakId ?? membre.id }
    });
  }
}
