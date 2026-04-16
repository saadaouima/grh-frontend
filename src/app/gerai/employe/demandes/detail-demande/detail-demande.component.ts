import { Component, inject, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { DemandeService } from 'src/app/gerai/services/demande.service';
import { Demande, TYPES_DEMANDE_CONFIG } from 'src/app/gerai/models/demande.model';

interface TimelineStep {
  label : string;
  icon  : string;
  active: boolean;
}

@Component({
  selector: 'app-detail-demande',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-demande.component.html',
  styleUrls: ['./detail-demande.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailDemandeComponent implements OnInit {

  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);
  private demandeService = inject(DemandeService);

  demande  !: Demande;
  timeline  : TimelineStep[] = [];
  loading   = true;
  error     = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.demandeService.getDemandeById(id).subscribe({
      next: demande => {
        this.demande  = demande;
        this.timeline = this.buildTimeline(demande);
        this.loading  = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private buildTimeline(d: Demande): TimelineStep[] {
    const isValidated = ['VALIDEE', 'VALIDEE_CHEF', 'VALIDEE_RH'].includes(d.statut);
    const isRejected  = d.statut === 'REJETEE';
    const isPending   = d.statut === 'EN_ATTENTE';

    return [
      { label: 'Soumise',    icon: 'ti ti-send',         active: true },
      { label: 'En cours',   icon: 'ti ti-clock',         active: !isPending || isValidated || isRejected },
      {
        label : isRejected ? 'Rejetée' : isValidated ? 'Validée' : 'Décision',
        icon  : isRejected ? 'ti ti-x' : isValidated ? 'ti ti-check' : 'ti ti-dots',
        active: isValidated || isRejected
      }
    ];
  }

  // ── Helpers ───────────────────────────────────────
  typeLabel(type: string): string {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type)?.label ?? type;
  }

  typeIcon(type: string): string {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type)?.icon ?? 'ti ti-file';
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'En attente', 'VALIDEE_CHEF': 'Validée Chef',
      'VALIDEE_RH': 'Validée RH', 'VALIDEE': 'Validée', 'REJETEE': 'Rejetée'
    };
    return map[statut] ?? statut;
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE': 'badge-warning', 'VALIDEE_CHEF': 'badge-success',
      'VALIDEE_RH': 'badge-success',  'VALIDEE': 'badge-success', 'REJETEE': 'badge-danger'
    };
    return map[statut] ?? 'badge-secondary';
  }

  goBack(): void { this.router.navigate(['/employe/demandes']); }
}
