import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

// Project imports
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { CardComponent }       from 'src/app/theme/shared/components/card/card.component';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { TacheService }        from 'src/app/gerai/services/tache-chef.service';
import { ProjetService }       from 'src/app/gerai/services/projet-chef.service';
import { Projet }              from 'src/app/gerai/models/projet.model';
import { Tache }               from 'src/app/gerai/models/tache.model';
import { Employe }             from 'src/app/gerai/models/employe.model';

@Component({
  selector   : 'app-affectation-taches',
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
  templateUrl: './affectation-taches.component.html',
  styleUrls  : ['./affectation-taches.component.scss']
})
export class AffectationTachesComponent implements OnInit {

  private fb            = inject(FormBuilder);
  private cdr           = inject(ChangeDetectorRef);
  private tacheService  = inject(TacheService);
  private projetService = inject(ProjetService);

  readonly priorities = [
    { label: 'Haute',   value: 'Haute',   color: '#ff5370' },
    { label: 'Moyenne', value: 'Moyenne', color: '#FFB64D' },
    { label: 'Basse',   value: 'Basse',   color: '#2ed8b6' }
  ];

  // ── Data ───────────────────────────────────────────────
  projets        : Projet[]  = [];
  employes       : Employe[] = [];
  taches         : Tache[]   = [];
  filteredTaches : Tache[]   = [];

  // ── State ──────────────────────────────────────────────
  loading           = false;
  error: string | null = null;
  selectedProjetNom : string        = '';
  selectedProjet    : Projet | null = null;
  filterPriorite    : string        = '';

  // ── Modal ──────────────────────────────────────────────
  showModal    = false;
  isEditMode   = false;
  isSaving     = false;
  editingTache  : Tache | null = null;
  membreChoisi  : any | null   = null;

  tacheForm!: FormGroup;

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  // ── Form ───────────────────────────────────────────────
  initForm(): void {
    this.tacheForm = this.fb.group({
      titre         : ['', Validators.required],
      description   : [''],
      priorite      : ['Moyenne', Validators.required],
      statut        : ['A_FAIRE', Validators.required],
      assigneA      : ['', Validators.required],
      dateDebut     : [''],
      echeance      : ['', Validators.required],
      effortEstime  : [null]
    });
  }

  // ── Data loading ───────────────────────────────────────
  loadData(): void {
    this.loading = true;
    this.error   = null;

    forkJoin({
      projets  : this.projetService.getProjets(),
      taches   : this.tacheService.getTaches(),
      employes : this.projetService.getEmployes()
    }).subscribe({
      next: ({ projets, taches, employes }) => {
        this.projets  = projets;
        this.taches   = taches;
        this.employes = employes;
        this.loading  = false;
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = 'Erreur lors du chargement des données.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Projet selection ───────────────────────────────────
  onProjetChange(): void {
    if (!this.selectedProjetNom) {
      this.selectedProjet = null;
      this.filteredTaches = [];
      return;
    }
    this.selectedProjet = this.projets.find(p => p.nom === this.selectedProjetNom) ?? null;
    this.filterPriorite = '';
    this.applyFilter();
  }

  // ── Filter ─────────────────────────────────────────────
  applyFilter(): void {
    this.filteredTaches = this.taches.filter(t => {
      const matchProjet   = t.projet === this.selectedProjetNom;
      const matchPriorite = !this.filterPriorite || t.priorite === this.filterPriorite;
      return matchProjet && matchPriorite;
    });
  }

  // ── Counters ───────────────────────────────────────────
  countByPriorite(priorite: string): number {
    return this.taches.filter(t => t.projet === this.selectedProjetNom && t.priorite === priorite).length;
  }

  getTaskCountForMembre(membreId: number): number {
    const membre = this.employes.find(e => e.id === membreId);
    if (!membre) return 0;
    const fullName = `${membre.prenom} ${membre.nom}`;
    return this.taches.filter(t => t.projet === this.selectedProjetNom && t.assigneA === fullName).length;
  }

  getPrioriteColor(priorite: string): string {
    return this.priorities.find(p => p.value === priorite)?.color ?? '#6c757d';
  }

  // ── Modal ──────────────────────────────────────────────
  openCreateTaskModal(): void {
    this.isEditMode   = false;
    this.editingTache = null;
    this.membreChoisi = null;
    this.tacheForm.reset({ priorite: 'Moyenne', statut: 'A_FAIRE' });
    this.showModal = true;
  }

  editTask(tache: Tache): void {
    this.isEditMode   = true;
    this.editingTache = tache;
    this.membreChoisi = (this.selectedProjet?.membres ?? [])
      .find((m: any) => `${m.prenom} ${m.nom}` === tache.assigneA) ?? null;
    this.tacheForm.patchValue({
      titre        : tache.titre,
      description  : tache.description ?? '',
      priorite     : tache.priorite,
      statut       : tache.statut ?? 'A_FAIRE',
      assigneA     : tache.assigneA ?? '',
      dateDebut    : tache.dateDebut ?? '',
      echeance     : tache.echeance,
      effortEstime : tache.effortEstime ?? null
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal    = false;
    this.editingTache = null;
    this.membreChoisi = null;
    this.tacheForm.reset();
  }

  selectMembre(m: any): void {
    this.membreChoisi = m;
    this.tacheForm.get('assigneA')?.setValue(`${m.prenom} ${m.nom}`);
  }

  // ── CRUD ───────────────────────────────────────────────
  saveTask(): void {
    if (this.tacheForm.invalid) return;
    this.isSaving = true;

    const val          = this.tacheForm.value;
    const prioriteColor = this.getPrioriteColor(val.priorite);

    if (this.isEditMode && this.editingTache) {
      const updated: Tache = {
        ...this.editingTache,
        titre        : val.titre,
        description  : val.description || undefined,
        priorite     : val.priorite,
        prioriteColor,
        statut       : val.statut,
        assigneA     : val.assigneA,
        dateDebut    : val.dateDebut || undefined,
        echeance     : val.echeance,
        effortEstime : val.effortEstime || undefined
      };

      this.tacheService.updateTache(updated.id, updated).subscribe({
        next: saved => {
          const idx = this.taches.findIndex(t => t.id === saved.id);
          if (idx !== -1) this.taches[idx] = saved;
          this.applyFilter();
          this.isSaving = false;
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: () => { this.isSaving = false; }
      });

    } else {
      const newTache: Omit<Tache, 'id'> = {
        titre        : val.titre,
        description  : val.description || undefined,
        projet       : this.selectedProjetNom,
        priorite     : val.priorite,
        prioriteColor,
        statut       : val.statut,
        assigneA     : val.assigneA,
        dateDebut    : val.dateDebut || undefined,
        echeance     : val.echeance,
        effortEstime : val.effortEstime || undefined
      };

      this.tacheService.createTache(newTache as Tache).subscribe({
        next: created => {
          this.taches.push(created);
          this.applyFilter();
          this.isSaving = false;
          this.closeModal();
          this.cdr.markForCheck();
        },
        error: () => { this.isSaving = false; }
      });
    }
  }

  deleteTask(tache: Tache): void {
    if (!confirm(`Supprimer la tâche "${tache.titre}" ?`)) return;

    this.tacheService.deleteTache(tache.id).subscribe({
      next: () => {
        this.taches = this.taches.filter(t => t.id !== tache.id);
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Erreur lors de la suppression.'; }
    });
  }

  // ── Display helpers ────────────────────────────────────
  getStatusBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS  : 'badge-primary',
      TERMINE   : 'badge-success',
      EN_PAUSE  : 'badge-warning',
      EN_RETARD : 'badge-danger'
    };
    return map[statut] ?? 'badge-secondary';
  }

  getStatusLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS  : 'En cours',
      TERMINE   : 'Terminé',
      EN_PAUSE  : 'En pause',
      EN_RETARD : 'En retard'
    };
    return map[statut] ?? statut;
  }

  getInitiales(fullName: string = ''): string {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return parts[0].charAt(0) + parts[1].charAt(0);
    return parts[0]?.charAt(0) ?? '?';
  }
}
