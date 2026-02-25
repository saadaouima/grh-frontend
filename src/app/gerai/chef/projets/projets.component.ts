import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe }    from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Project imports
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { CardComponent }       from 'src/app/theme/shared/components/card/card.component';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { Projet }              from 'src/app/theme/shared/interfaces/projet';
import { Employe }             from 'src/app/theme/shared/interfaces/employe';

@Component({
  selector   : 'app-projets',
  standalone : true,
  imports    : [
    CommonModule,           // ngClass, slice pipe
    DatePipe,               // date pipe
    FormsModule,            // ngModel
    ReactiveFormsModule,    // formGroup, formControlName
    SharedModule,           // directives partagées
    CardComponent,          // app-card
    BreadcrumbComponent    // app-breadcrumb
  ],
  templateUrl: './projets.component.html',
  styleUrls  : ['./projets.component.scss']
})
export class ProjetsComponent implements OnInit {

  private fb = inject(FormBuilder);


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
  searchTerm   = '';
  statusFilter = '';

  // ── Modal state ────────────────────────────────────────
  showModal       = false;
  showDetailModal = false;
  isEditMode      = false;
  isSaving        = false;

  projetForm!: FormGroup;

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    this.initForm();
    this.loadFakeData();
    this.computeStats();
  }

  // ── Form ───────────────────────────────────────────────
  initForm(): void {
    this.projetForm = this.fb.group({
      nom        : ['', Validators.required],
      description: [''],
      dateDebut  : ['', Validators.required],
      datefin    : [''],
      statut     : ['Enattente'],
      progression: [0]
    });
  }

  // ── Fake data (à remplacer par un service) ────────────
  loadFakeData(): void {
    this.employes = [
      { id: 1, nom: 'Ben Ali',  prenom: 'Sami',    email: 's.benali@gerai.tn',  poste: 'Développeur', departement: 'Informatique' },
      { id: 2, nom: 'Trabelsi', prenom: 'Ines',    email: 'i.trabelsi@gerai.tn', poste: 'Designer',    departement: 'Design'       },
      { id: 3, nom: 'Gharbi',   prenom: 'Mohamed', email: 'm.gharbi@gerai.tn',  poste: 'Analyste',    departement: 'Informatique' },
      { id: 4, nom: 'Sassi',    prenom: 'Leila',   email: 'l.sassi@gerai.tn',   poste: 'Testeur',     departement: 'Qualité'      },
      { id: 5, nom: 'Hammami',  prenom: 'Youssef', email: 'y.hammami@gerai.tn', poste: 'DevOps',      departement: 'Informatique' }
    ];

    this.projets = [
      {
        id: 1, nom: 'Refonte Système RH',
        description: 'Migration et modernisation complète du système RH vers une plateforme cloud.',
        dateDebut: '2025-01-15', datefin: '2025-06-30',
        statut: 'Encours', progression: 65,
        chefProjet: 'Ahmed Mansour',
        membres: [this.employes[0], this.employes[1], this.employes[2]]
      },
      {
        id: 2, nom: 'Application Mobile Employés',
        description: "Développement d'une application mobile RH.",
        dateDebut: '2025-02-01', datefin: '2025-08-31',
        statut: 'Encours', progression: 40,
        chefProjet: 'Ahmed Mansour',
        membres: [this.employes[0], this.employes[3]]
      },
      {
        id: 3, nom: 'Portail Fournisseurs',
        description: "Portail de gestion des fournisseurs et appels d'offres.",
        dateDebut: '2024-09-01', datefin: '2024-12-31',
        statut: 'Termine', progression: 100,
        chefProjet: 'Ahmed Mansour',
        membres: [this.employes[1], this.employes[2], this.employes[4]]
      },
      {
        id: 4, nom: 'Tableau de Bord Analytics',
        description: 'Dashboard analytique pour le suivi des KPIs RH.',
        dateDebut: '2025-03-01', datefin: '2025-04-30',
        statut: 'Enretard', progression: 20,
        chefProjet: 'Ahmed Mansour',
        membres: [this.employes[2], this.employes[3]]
      },
      {
        id: 5, nom: 'Formation IA & Automatisation',
        description: "Programme de formation aux outils d'intelligence artificielle.",
        dateDebut: '2025-07-01', datefin: '2025-12-31',
        statut: 'Enattente', progression: 0,
        chefProjet: 'Ahmed Mansour',
        membres: [...this.employes]
      }
    ];

    this.filteredProjets = [...this.projets];
  }

  // ── Stats ──────────────────────────────────────────────
  computeStats(): void {
    this.totalProjets     = this.projets.length;
    this.projetsEnCours   = this.projets.filter(p => p.statut === 'Encours').length;
    this.projetsTermines  = this.projets.filter(p => p.statut === 'Termine').length;
    this.projetsEnAttente = this.projets.filter(p => p.statut === 'Enattente').length;
    this.projetsEnRetard  = this.projets.filter(p => p.statut === 'Enretard').length;
    this.tauxReussite     = this.totalProjets
      ? Math.round((this.projetsTermines / this.totalProjets) * 100)
      : 0;
  }

  // ── Filter ─────────────────────────────────────────────
  filterProjets(): void {
    this.filteredProjets = this.projets.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || p.statut === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  // ── Modal helpers ──────────────────────────────────────
  openCreateModal(): void {
    this.isEditMode     = false;
    this.selectedMembres = [];
    this.projetForm.reset({ statut: 'Enattente', progression: 0 });
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
      datefin    : projet.datefin ?? '',
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

  // ── CRUD ───────────────────────────────────────────────
  saveProjet(): void {
    if (this.projetForm.invalid) return;
    this.isSaving = true;
    const formVal = this.projetForm.value;

    // Simule un appel API (à remplacer par projetService.save())
    setTimeout(() => {
      if (this.isEditMode && this.selectedProjet) {
        const idx = this.projets.findIndex(p => p.id === this.selectedProjet!.id);
        this.projets[idx] = { ...this.selectedProjet, ...formVal, membres: this.selectedMembres };
      } else {
        const newId = this.projets.length ? Math.max(...this.projets.map(p => p.id)) + 1 : 1;
        this.projets.push({
          id: newId,
          chefProjet: 'Ahmed Mansour',
          membres: this.selectedMembres,
          ...formVal
        });
      }
      this.filteredProjets = [...this.projets];
      this.computeStats();
      this.isSaving = false;
      this.closeModal();
    }, 700);
  }

  deleteProjet(projet: Projet): void {
    if (!confirm(`Supprimer le projet "${projet.nom}" ?`)) return;
    this.projets        = this.projets.filter(p => p.id !== projet.id);
    this.filteredProjets = [...this.projets];
    this.computeStats();
  }

  // ── Display helpers ────────────────────────────────────
  getStatusBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      Encours  : 'badge-primary',
      Termine  : 'badge-success',
      Enattente: 'badge-warning',
      Enretard : 'badge-danger'
    };
    return map[statut] ?? 'badge-secondary';
  }

  getStatusLabel(statut: string): string {
    const map: Record<string, string> = {
      Encours  : 'En cours',
      Termine  : 'Terminé',
      Enattente: 'En attente',
      Enretard : 'En retard'
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