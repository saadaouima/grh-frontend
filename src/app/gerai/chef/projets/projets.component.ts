import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe }    from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Keycloak from 'keycloak-js';
import { forkJoin } from 'rxjs';

// Project imports
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { CardComponent }       from 'src/app/theme/shared/components/card/card.component';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { Employe }             from 'src/app/theme/shared/interfaces/employe';
import { ProjetService }       from '../../services/projet-chef.service';
import { Projet }              from '../../models/projet.model';
import { StatutProjet }        from '../../models/projet.model';
import { ChangeDetectorRef }   from '@angular/core';

@Component({
  selector   : 'app-projets',
  standalone : true,
  imports    : [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CardComponent,
    BreadcrumbComponent
  ],
  templateUrl: './projets.component.html',
  styleUrls  : ['./projets.component.scss']
})
export class ProjetsComponent implements OnInit {

  constructor(private cd: ChangeDetectorRef) {}

  private keycloak = inject(Keycloak);
  private fb = inject(FormBuilder);
  private projetService = inject(ProjetService);

  // ── Stats ──────────────────────────────────────────────
  totalProjets    = 0;
  projetsEnCours  = 0;
  projetsTermines = 0;
  projetsEnAttente = 0;
  projetsEnRetard  = 0;
  tauxReussite     = 0;

  // ── Data ───────────────────────────────────────────────
  projets        : Projet[]  = [];
  filteredProjets: Projet[]  = [];
  employes       : Employe[] = [];
  selectedMembres: Employe[] = [];
  selectedProjet : Projet | null = null;
  
  // ── Filters ────────────────────────────────────────────
  searchTerm = '';
  statusFilter: StatutProjet | '' = '';
  StatutProjet = StatutProjet;

  // ── Modal state ────────────────────────────────────────
  showModal       = false;
  showDetailModal = false;
  isEditMode      = false;
  isSaving        = false;

  projetForm!: FormGroup;

  managerNomComplet: string = '';

  

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  // ── Form ───────────────────────────────────────────────
  initForm(): void {
    this.projetForm = this.fb.group({
      nom        : ['', Validators.required],
      description: [''],
      dateDebut  : ['', Validators.required],
      dateFin    : [''],
      statut     : [StatutProjet.EN_PAUSE],
      progression: [0]
    });
  }

  // ── Load data from service (MSW handlers will respond) ─
  loadData(): void {
      forkJoin({
      projets: this.projetService.getProjets(),
      employes: this.projetService.getEmployes()
    }).subscribe(({ projets, employes }) => {
      this.employes = employes;
      this.projets = projets;
       console.log('Raw projets from service:', projets);

      const managerFullName = this.getManagerFullName();
      console.log('Manager full name:', managerFullName);

      

      this.projets = projets.map(p => ({
        ...p,
        chefProjet: managerFullName, // ✅ inject full name here
        membres: employes.filter(e => p.membres?.some(m => m.id === e.id)),
        dateFin: p.dateFin
      }));

      this.filteredProjets = [...this.projets];

      console.log('Filtered projets after mapping:', this.filteredProjets);

      this.computeStats();
      this.cd.detectChanges();
    });
  }


  private getManagerFullName(): string {
    const token = this.keycloak.tokenParsed;
    console.log('Token parsed:', token);
    if (!token) return '—';

    const prenom = token?.['given_name'] || '';
    const nom = token?.['family_name'] || '';

    if (prenom && nom) {
      return `${prenom} ${nom}`; // ✅ full name
    }

    // fallback if only "name" or "preferred_username" exists
    return token?.['name'] || token?.['preferred_username'] || '—';
  }

  // ── Stats ──────────────────────────────────────────────
 computeStats(): void {
    this.totalProjets     = this.projets.length;
    this.projetsEnCours   = this.projets.filter(p => p.statut === StatutProjet.EN_COURS).length;
    this.projetsTermines  = this.projets.filter(p => p.statut === StatutProjet.TERMINE).length;
    this.projetsEnAttente = this.projets.filter(p => p.statut === StatutProjet.EN_PAUSE).length;
    this.projetsEnRetard  = this.projets.filter(p => p.statut === StatutProjet.EN_RETARD).length;

    this.tauxReussite = this.totalProjets
      ? Math.round((this.projetsTermines / this.totalProjets) * 100)
      : 0;
 }


  // ── Filter ─────────────────────────────────────────────
  filterProjets(): void {
    this.filteredProjets = this.projets.filter(p => {
      const matchSearch =
        !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus =
        !this.statusFilter || p.statut === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }


  // ── Modal helpers ──────────────────────────────────────
  openCreateModal(): void {
    this.isEditMode     = false;
    this.selectedMembres = [];
    this.projetForm.reset({ statut: StatutProjet.EN_PAUSE, progression: 0 });
    this.showModal = true;
  }

  editProjet(projet: Projet): void {
    this.isEditMode      = true;
    this.selectedProjet  = projet;
    this.selectedMembres = [...(projet.membres ?? [])];
    this.projetForm.patchValue({
      nom        : projet.nom,
      description: projet.description ?? '',
      dateDebut  : projet.dateDebut,
      dateFin    : projet.dateFin ?? '',
      statut     : projet.statut,
      progression: projet.progression ?? 0
    });
    this.showModal = true;
  }

  viewProjet(projet: Projet): void {
    this.selectedProjet  = projet;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.projetForm.reset();
    this.selectedMembres = [];
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedProjet  = null;
  }




  // ── Membres ────────────────────────────────────────────
  isMembre(emp: Employe): boolean {
    return this.selectedMembres.some(m => m.id === emp.id);
  }

  toggleMembre(emp: Employe): void {
    const idx = this.selectedMembres.findIndex(m => m.id === emp.id);
    if (idx === -1) {
      this.selectedMembres.push(emp);
    } else {
      this.selectedMembres.splice(idx, 1);
    }
  }

  

  // ── CRUD (via service, MSW intercepts) ─────────────────
  saveProjet(): void {
    if (this.projetForm.invalid) return;
    this.isSaving = true;
    const formVal = this.projetForm.value;

    if (this.isEditMode && this.selectedProjet) {
      this.projetService.updateProjet(this.selectedProjet.id, {
        ...this.selectedProjet,
        ...formVal,
        membres: this.selectedMembres
      }).subscribe(updated => {
        const idx = this.projets.findIndex(p => p.id === updated.id);
        this.projets[idx] = updated;
        this.refreshAfterSave();
      });
    } else {
      this.projetService.createProjet({
        chefProjet: 'Ahmed Mansour',
        membres: this.selectedMembres,
        ...formVal
      }).subscribe(created => {
        this.projets.push(created);
        this.refreshAfterSave();
      });
    }
  }

  private refreshAfterSave(): void {
    this.filteredProjets = [...this.projets];
    this.computeStats();
    this.isSaving = false;
    this.closeModal();
  }

  deleteProjet(projet: Projet): void {
    if (!confirm(`Supprimer le projet "${projet.nom}" ?`)) return;
    this.projetService.deleteProjet(projet.id).subscribe(() => {
      this.projets = this.projets.filter(p => p.id !== projet.id);
      this.filteredProjets = [...this.projets];
      this.computeStats();
    });
  }

  // ── UI helpers ─────────────────────────────────────────
 getStatusBadgeClass(statut: StatutProjet): string {
  const map: Record<StatutProjet, string> = {
    [StatutProjet.EN_COURS]: 'badge-primary',
    [StatutProjet.TERMINE]: 'badge-success',
    [StatutProjet.EN_PAUSE]: 'badge-warning',
    [StatutProjet.EN_RETARD]: 'badge-danger'
  };
  return map[statut] ?? 'badge-secondary';
}

getStatusLabel(statut: StatutProjet): string {
  const map: Record<StatutProjet, string> = {
    [StatutProjet.EN_COURS]: 'En cours',
    [StatutProjet.TERMINE]: 'Terminé',
    [StatutProjet.EN_PAUSE]: 'En attente',
    [StatutProjet.EN_RETARD]: 'En retard'
  };
  return map[statut] ?? statut;
}


  getProgressClass(progression: number): string {
    if (progression >= 80) return 'bg-success';
    if (progression >= 50) return 'bg-primary';
    if (progression >= 25) return 'bg-warning';
    return 'bg-danger';
  }
}