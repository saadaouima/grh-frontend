import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { CongesService } from 'src/app/gerai/services/conge.service';
import {
    SoldeConge,
    DemandeConge,
    StatistiquesConges
} from 'src/app/gerai/models/conge.model';

@Component({
    selector: 'app-mes-conges',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        CardComponent
    ],
    templateUrl: './mes-conges.component.html',
    styleUrls: ['./mes-conges.component.scss']
})
export class MesCongesComponent implements OnInit {
    /* ──────────────────────────────────────────────────────────
       💉 SERVICES INJECTÉS
       ────────────────────────────────────────────────────────── */
    private congesService = inject(CongesService);
    private cdr = inject(ChangeDetectorRef);

    /* ──────────────────────────────────────────────────────────
       📊 ÉTAT DU COMPOSANT
       ────────────────────────────────────────────────────────── */
    isLoading = false;

    solde!: SoldeConge;
    demandes: DemandeConge[] = [];
    statistiques!: StatistiquesConges;

    /* ══════════════════════════════════════════════════════════════
       🔄 LIFECYCLE
       ══════════════════════════════════════════════════════════════ */

    ngOnInit(): void {
        console.log('🏖️ [MesConges] Initialisation...');
        this.loadData();
    }

    /* ══════════════════════════════════════════════════════════════
       📡 CHARGEMENT DES DONNÉES
       ══════════════════════════════════════════════════════════════ */

    /**
     * ✨ OPTIMISATION: Charge toutes les données en une seule requête
     */
    loadData(): void {
        this.isLoading = true;

        // ✅ Une seule requête pour tout charger
        this.congesService.getCongesComplet().subscribe({
            next: (data) => {
                console.log('✅ [MesConges] Données chargées', data);

                this.solde = data.solde;
                this.demandes = data.demandes;
                this.statistiques = data.statistiques;

                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('❌ [MesConges] Erreur chargement:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    /* ══════════════════════════════════════════════════════════════
       🎨 HELPERS UI
       ══════════════════════════════════════════════════════════════ */

    /**
     * Retourne l'icône selon le type de congé
     */
    getTypeIcon(type: DemandeConge['type']): string {
        const icons = {
            'ANNUEL': 'ti ti-sun',
            'MALADIE': 'ti ti-stethoscope',
            'RTT': 'ti ti-clock',
            'SANS_SOLDE': 'ti ti-ban'
        };
        return icons[type] || 'ti ti-calendar';
    }

    /**
     * Retourne le label du statut
     */
    getStatutLabel(statut: DemandeConge['statut']): string {
        const labels = {
            'EN_ATTENTE': 'En attente',
            'APPROUVE': 'Approuvé',
            'REJETE': 'Rejeté'
        };
        return labels[statut] || statut;
    }

    /**
     * Retourne la classe CSS du statut
     */
    getStatutClass(statut: DemandeConge['statut']): string {
        const classes = {
            'EN_ATTENTE': 'badge-warning',
            'APPROUVE': 'badge-success',
            'REJETE': 'badge-danger'
        };
        return classes[statut] || '';
    }

    /**
     * Retourne le label du type de congé
     */
    getTypeLabel(type: DemandeConge['type']): string {
        const labels = {
            'ANNUEL': 'Congé annuel',
            'MALADIE': 'Maladie',
            'RTT': 'RTT',
            'SANS_SOLDE': 'Sans solde'
        };
        return labels[type] || type;
    }

    /**
     * Vérifie si une demande peut être annulée
     */
    canAnnuler(demande: DemandeConge): boolean {
        return demande.statut === 'EN_ATTENTE' &&
            new Date(demande.dateDebut) > new Date();
    }

    /**
     * Annule une demande
     */
    annulerDemande(demande: DemandeConge): void {
        if (!confirm(`Voulez-vous vraiment annuler cette demande de ${this.getTypeLabel(demande.type)} ?`)) {
            return;
        }

        console.log('🗑️ [MesConges] Annulation demande:', demande.id);

        this.congesService.annulerDemande(demande.id).subscribe({
            next: () => {
                // Retirer de la liste
                this.demandes = this.demandes.filter(d => d.id !== demande.id);
                console.log('✅ [MesConges] Demande annulée');
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('❌ [MesConges] Erreur annulation:', err);
                alert('Erreur lors de l\'annulation de la demande');
            }
        });
    }

    /**
     * Formatte une date ISO en format lisible
     */
    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Calcule le pourcentage de progression
     */
    getProgression(utilise: number, total: number): number {
        return Math.round((utilise / total) * 100);
    }
}