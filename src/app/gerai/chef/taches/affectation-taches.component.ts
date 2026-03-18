import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe }    from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Project imports
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { CardComponent }       from 'src/app/theme/shared/components/card/card.component';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { Projet }              from 'src/app/theme/shared/interfaces/projet';
import { Employe }             from 'src/app/theme/shared/interfaces/employe';
import { Tache }               from 'src/app/theme/shared/interfaces/tache';

@Component({
  selector   : 'app-affectation-taches',
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
  templateUrl: './affectation-taches.component.html',
  styleUrls  : ['./affectation-taches.component.scss']
})
export class AffectationTachesComponent implements OnInit {

  private fb = inject(FormBuilder);


  priorities = [
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
  selectedProjetNom : string         = '';
  selectedProjet    : Projet | null  = null;
  filterPriorite    : string         = '';

  // ── Modal ──────────────────────────────────────────────
  showModal    = false;
  isEditMode   = false;
  isSaving     = false;
  editingTache : Tache | null = null;

  tacheForm!: FormGroup;

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    this.initForm();
    this.loadFakeData();
  }

  // ── Form ───────────────────────────────────────────────
  initForm(): void {
    this.tacheForm = this.fb.group({
      titre    : ['', Validators.required],
      priorite : ['Moyenne', Validators.required],
      assigneA : ['', Validators.required],
      echeance : ['', Validators.required]
    });
  }

  // ── Fake data ─────────────────────────────────────────
  loadFakeData(): void {
    this.employes = [
      { id: 1, nom: 'Ben Ali',  prenom: 'Sami',    email: 's.benali@gerai.tn',   poste: 'Développeur', departement: 'Informatique' },
      { id: 2, nom: 'Trabelsi', prenom: 'Ines',    email: 'i.trabelsi@gerai.tn', poste: 'Designer',    departement: 'Design'       },
      { id: 3, nom: 'Gharbi',   prenom: 'Mohamed', email: 'm.gharbi@gerai.tn',   poste: 'Analyste',    departement: 'Informatique' },
      { id: 4, nom: 'Sassi',    prenom: 'Leila',   email: 'l.sassi@gerai.tn',    poste: 'Testeur',     departement: 'Qualité'      },
      { id: 5, nom: 'Hammami',  prenom: 'Youssef', email: 'y.hammami@gerai.tn',  poste: 'DevOps',      departement: 'Informatique' }
    ];

    this.projets = [
      {
        id: 1, nom: 'Refonte Système RH',
        description: 'Migration complète du système RH.',
        dateDebut: '2025-01-15', datefin: '2025-06-30',
        statut: 'Encours', progression: 65,
        chefProjet: 'Ahmed Mansour',
        membres: [this.employes[0], this.employes[1], this.employes[2]]
      },
      {
        id: 2, nom: 'Application Mobile Employés',
        description: 'App mobile de gestion RH.',
        dateDebut: '2025-02-01', datefin: '2025-08-31',
        statut: 'Encours', progression: 40,
        chefProjet: 'Ahmed Mansour',
        membres: [this.employes[0], this.employes[3]]
      },
      {
        id: 3, nom: 'Tableau de Bord Analytics',
        description: 'Dashboard KPIs RH.',
        dateDebut: '2025-03-01', datefin: '2025-04-30',
        statut: 'Enretard', progression: 20,
        chefProjet: 'Ahmed Mansour',
        membres: [this.employes[2], this.employes[3], this.employes[4]]
      }
    ];

    this.taches = [
      { id: 1, titre: 'Analyse des besoins',      projet: 'Refonte Système RH',         priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-01-31', assigneA: 'Mohamed Gharbi'  },
      { id: 2, titre: 'Conception UX/UI',          projet: 'Refonte Système RH',         priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-02-28', assigneA: 'Ines Trabelsi'   },
      { id: 3, titre: 'Développement backend API', projet: 'Refonte Système RH',         priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-04-30', assigneA: 'Sami Ben Ali'    },
      { id: 4, titre: 'Intégration Keycloak',      projet: 'Refonte Système RH',         priorite: 'Moyenne', prioriteColor: '#FFB64D', echeance: '2025-04-15', assigneA: 'Sami Ben Ali'    },
      { id: 5, titre: 'Tests unitaires',           projet: 'Refonte Système RH',         priorite: 'Basse',   prioriteColor: '#2ed8b6', echeance: '2025-05-15', assigneA: 'Mohamed Gharbi'  },
      { id: 6, titre: 'Maquettes mobile',          projet: 'Application Mobile Employés', priorite: 'Haute',  prioriteColor: '#ff5370', echeance: '2025-03-15', assigneA: 'Ines Trabelsi'   },
      { id: 7, titre: 'Tests QA mobile',           projet: 'Application Mobile Employés', priorite: 'Moyenne',prioriteColor: '#FFB64D', echeance: '2025-05-31', assigneA: 'Leila Sassi'     },
      { id: 8, titre: 'Config infrastructure',     projet: 'Tableau de Bord Analytics',  priorite: 'Haute',   prioriteColor: '#ff5370', echeance: '2025-04-20', assigneA: 'Youssef Hammami' }
    ];
  }

  // ── Projet selection ───────────────────────────────────
  onProjetChange(): void {
    if (!this.selectedProjetNom) {
      this.selectedProjet = null;
      this.filteredTaches = [];
      return;
    }
    this.selectedProjet  = this.projets.find(p => p.nom === this.selectedProjetNom) ?? null;
    this.filterPriorite  = '';
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
    this.tacheForm.reset({ priorite: 'Moyenne' });
    this.showModal = true;
  }

  editTask(tache: Tache): void {
    this.isEditMode   = true;
    this.editingTache = tache;
    this.tacheForm.patchValue({
      titre   : tache.titre,
      priorite: tache.priorite,
      assigneA: tache.assigneA ?? '',
      echeance: tache.echeance
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal    = false;
    this.editingTache = null;
    this.tacheForm.reset();
  }

  // ── CRUD ───────────────────────────────────────────────
  saveTask(): void {
    if (this.tacheForm.invalid) return;
    this.isSaving = true;
    const val = this.tacheForm.value;
    const prioriteColor = this.getPrioriteColor(val.priorite);

    setTimeout(() => {
      if (this.isEditMode && this.editingTache) {
        const idx = this.taches.findIndex(t => t.id === this.editingTache!.id);
        this.taches[idx] = {
          ...this.editingTache,
          titre        : val.titre,
          priorite     : val.priorite,
          prioriteColor,
          assigneA     : val.assigneA,
          echeance     : val.echeance
        };
      } else {
        const newId = this.taches.length ? Math.max(...this.taches.map(t => t.id)) + 1 : 1;
        this.taches.push({
          id           : newId,
          titre        : val.titre,
          projet       : this.selectedProjetNom,
          priorite     : val.priorite,
          prioriteColor,
          assigneA     : val.assigneA,
          echeance     : val.echeance
        });
      }
      this.applyFilter();
      this.isSaving = false;
      this.closeModal();
    }, 700);
  }

  deleteTask(tache: Tache): void {
    if (!confirm(`Supprimer la tâche "${tache.titre}" ?`)) return;
    this.taches = this.taches.filter(t => t.id !== tache.id);
    this.applyFilter();
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

  // Initiales depuis "Prénom Nom"
  getInitiales(fullName: string = ''): string {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return parts[0].charAt(0) + parts[1].charAt(0);
    return parts[0]?.charAt(0) ?? '?';
  }
}