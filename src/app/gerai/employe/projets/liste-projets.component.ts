// Angular Import
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

// ─── Interfaces ─────────────────────────────────────────────────────────────
export interface Membre {
  id: number;
  nom: string;
  initiales: string;
}

export interface Projet {
  id: number;
  nom: string;
  description: string;
  couleur: string;
  statut: 'EN_COURS' | 'EN_PAUSE' | 'TERMINE';
  progression: number;
  dateDebut: Date;
  dateEcheance: Date;
  totalTaches: number;
  tachesCompletees: number;
  equipe: Membre[];
}

export interface TacheProjet {
  id: number;
  titre: string;
  projetNom: string;
  projetCouleur: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  echeance: Date;
  terminee: boolean;
}

@Component({
  selector: 'app-liste-projets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CardComponent
  ],
  templateUrl: './liste-projets.component.html',
  styleUrls: ['./liste-projets.component.scss']
})
export class ListeProjetsComponent implements OnInit {

  private router = inject(Router);

  // ── View Mode ───────────────────────────────────────
  viewMode: 'grid' | 'list' = 'grid';

  // ── Data ────────────────────────────────────────────
  projets: Projet[] = [];
  projetsFiltres: Projet[] = [];
  mesTachesRecentes: TacheProjet[] = [];

  // ── Stats ───────────────────────────────────────────
  totalProjets: number = 0;
  projetsEnCours: number = 0;
  totalTaches: number = 0;
  tauxCompletion: number = 0;

  // ── Filters ─────────────────────────────────────────
  searchTerm: string = '';
  selectedStatut: string = '';

  // ── Lifecycle ───────────────────────────────────────
  ngOnInit(): void {
    this.loadProjets();
    this.loadMesTaches();
  }

  // ── Load Data ───────────────────────────────────────
  loadProjets(): void {
    // TODO: Remplacer par appel API Spring Boot
    // this.projetService.getMesProjets().subscribe(...)

    this.projets = [
      {
        id: 1,
        nom: 'GerAI - Module RH',
        description: 'Développement du système de gestion RH avec dashboard employé et chef',
        couleur: '#3B82F6',
        statut: 'EN_COURS',
        progression: 68,
        dateDebut: new Date('2024-01-15'),
        dateEcheance: new Date('2024-03-30'),
        totalTaches: 24,
        tachesCompletees: 16,
        equipe: [
          { id: 1, nom: 'Nour El Houda', initiales: 'NH' },
          { id: 2, nom: 'Ahmed Ben Ali', initiales: 'AB' },
          { id: 3, nom: 'Sara Trabelsi', initiales: 'ST' },
          { id: 4, nom: 'Mohamed Khiari', initiales: 'MK' }
        ]
      },
      {
        id: 2,
        nom: 'Module Absences',
        description: 'Système de gestion des congés et absences avec validation automatique',
        couleur: '#10B981',
        statut: 'EN_COURS',
        progression: 45,
        dateDebut: new Date('2024-02-01'),
        dateEcheance: new Date('2024-04-15'),
        totalTaches: 18,
        tachesCompletees: 8,
        equipe: [
          { id: 1, nom: 'Nour El Houda', initiales: 'NH' },
          { id: 5, nom: 'Rania Mseddi', initiales: 'RM' },
          { id: 6, nom: 'Karim Essid', initiales: 'KE' }
        ]
      },
      {
        id: 3,
        nom: 'Formation API Spring',
        description: 'Projet d\'apprentissage et documentation de Spring Boot pour l\'équipe',
        couleur: '#F59E0B',
        statut: 'EN_COURS',
        progression: 30,
        dateDebut: new Date('2024-02-10'),
        dateEcheance: new Date('2024-03-10'),
        totalTaches: 12,
        tachesCompletees: 4,
        equipe: [
          { id: 1, nom: 'Nour El Houda', initiales: 'NH' },
          { id: 2, nom: 'Ahmed Ben Ali', initiales: 'AB' }
        ]
      },
      {
        id: 4,
        nom: 'Migration Base de Données',
        description: 'Migration de PostgreSQL vers une architecture microservices',
        couleur: '#8B5CF6',
        statut: 'TERMINE',
        progression: 100,
        dateDebut: new Date('2024-01-05'),
        dateEcheance: new Date('2024-02-15'),
        totalTaches: 10,
        tachesCompletees: 10,
        equipe: [
          { id: 1, nom: 'Nour El Houda', initiales: 'NH' },
          { id: 7, nom: 'Yasmine Lahmar', initiales: 'YL' },
          { id: 8, nom: 'Omar Saidi', initiales: 'OS' }
        ]
      },
      {
        id: 5,
        nom: 'Dashboard Analytics',
        description: 'Tableaux de bord interactifs pour les KPIs RH',
        couleur: '#EF4444',
        statut: 'EN_PAUSE',
        progression: 25,
        dateDebut: new Date('2024-01-20'),
        dateEcheance: new Date('2024-05-01'),
        totalTaches: 15,
        tachesCompletees: 4,
        equipe: [
          { id: 3, nom: 'Sara Trabelsi', initiales: 'ST' },
          { id: 4, nom: 'Mohamed Khiari', initiales: 'MK' }
        ]
      }
    ];

    this.calculateStats();
    this.projetsFiltres = [...this.projets];
  }

  loadMesTaches(): void {
    // TODO: Remplacer par appel API
    this.mesTachesRecentes = [
      {
        id: 1,
        titre: 'Intégration API authentification',
        projetNom: 'GerAI - Module RH',
        projetCouleur: '#3B82F6',
        priorite: 'Haute',
        echeance: new Date('2024-02-25'),
        terminee: false
      },
      {
        id: 2,
        titre: 'Design interface validation congés',
        projetNom: 'Module Absences',
        projetCouleur: '#10B981',
        priorite: 'Moyenne',
        echeance: new Date('2024-02-28'),
        terminee: false
      },
      {
        id: 3,
        titre: 'Documentation endpoints REST',
        projetNom: 'Formation API Spring',
        projetCouleur: '#F59E0B',
        priorite: 'Basse',
        echeance: new Date('2024-03-05'),
        terminee: false
      },
      {
        id: 4,
        titre: 'Tests unitaires service utilisateur',
        projetNom: 'GerAI - Module RH',
        projetCouleur: '#3B82F6',
        priorite: 'Haute',
        echeance: new Date('2024-02-26'),
        terminee: true
      },
      {
        id: 5,
        titre: 'Optimisation requêtes SQL',
        projetNom: 'Migration Base de Données',
        projetCouleur: '#8B5CF6',
        priorite: 'Moyenne',
        echeance: new Date('2024-02-20'),
        terminee: true
      }
    ];
  }

  // ── Calculate Stats ─────────────────────────────────
  calculateStats(): void {
    this.totalProjets = this.projets.length;
    this.projetsEnCours = this.projets.filter(p => p.statut === 'EN_COURS').length;
    this.totalTaches = this.projets.reduce((sum, p) => sum + p.totalTaches, 0);
    
    const totalProgression = this.projets.reduce((sum, p) => sum + p.progression, 0);
    this.tauxCompletion = this.projets.length > 0 
      ? Math.round(totalProgression / this.projets.length) 
      : 0;
  }

  // ── Filter Projets ──────────────────────────────────
  filterProjets(): void {
    this.projetsFiltres = this.projets.filter(projet => {
      const matchSearch = !this.searchTerm || 
        projet.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        projet.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatut = !this.selectedStatut || projet.statut === this.selectedStatut;

      return matchSearch && matchStatut;
    });
  }

  // ── Reset Filters ───────────────────────────────────
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.filterProjets();
  }

  // ── Get Statut Label ────────────────────────────────
  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'EN_COURS': 'En cours',
      'EN_PAUSE': 'En pause',
      'TERMINE': 'Terminé'
    };
    return labels[statut] || statut;
  }

  // ── Actions ─────────────────────────────────────────
  voirDetailProjet(projetId: number): void {
    // TODO: Naviguer vers page détail projet
    console.log('Voir projet:', projetId);
    // this.router.navigate(['/employe/projets', projetId]);
  }

  toggleTache(tacheId: number): void {
    const tache = this.mesTachesRecentes.find(t => t.id === tacheId);
    if (tache) {
      tache.terminee = !tache.terminee;
      
      // TODO: Appel API pour sauvegarder
      console.log('Tâche', tacheId, 'marquée comme', tache.terminee ? 'terminée' : 'à faire');
    }
  }

}