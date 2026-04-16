import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DemandeService }      from 'src/app/gerai/services/demande.service';
import { ProfilEmployeService } from 'src/app/gerai/services/employe-profile.service';
import { CreateDemandeDTO, TYPES_DEMANDE_CONFIG } from 'src/app/gerai/models/demande.model';

@Component({
  selector: 'app-deposer-demande',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './deposer-demande.component.html',
  styleUrls: ['./deposer-demande.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeposerDemandeComponent implements OnInit {

  private fb             = inject(FormBuilder);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);
  private demandeService = inject(DemandeService);
  private profilService  = inject(ProfilEmployeService);

  readonly typesConfig = TYPES_DEMANDE_CONFIG;

  form = this.fb.group({
    type       : ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    dateDebut  : [''],
    dateFin    : ['']
  });

  // General optional attachments (non-maladie)
  files             : File[]       = [];
  // Mandatory medical certificate for MALADIE
  certificatMedical : File | null  = null;
  certError         = false;

  isSaving   = false;
  errorMsg   : string | null = null;

  // Congé balance loaded from profile service
  congesRestants = 0;

  // ── Lifecycle ───────────────────────────────────────────
  ngOnInit(): void {
    this.profilService.getStatistiques().subscribe({
      next: stats => {
        this.congesRestants = stats.congesRestants;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Computed helpers ────────────────────────────────────
  get selectedType(): string {
    return this.form.get('type')?.value ?? '';
  }

  get isConge(): boolean   { return this.selectedType === 'CONGE';   }
  get isMaladie(): boolean  { return this.selectedType === 'MALADIE'; }

  get requiresDates(): boolean {
    return this.typesConfig.find(c => c.type === this.selectedType)?.requiresDates ?? false;
  }

  /** Calendar days inclusive of start and end date. */
  get dureeJours(): number {
    const debut = this.form.get('dateDebut')?.value;
    const fin   = this.form.get('dateFin')?.value;
    if (!debut || !fin) return 0;
    const d1 = new Date(debut);
    const d2 = new Date(fin);
    if (d2 < d1) return 0;
    return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  get depasseSolde(): boolean {
    return this.isConge && this.dureeJours > 0 && this.dureeJours > this.congesRestants;
  }

  get joursDepassement(): number {
    return Math.max(0, this.dureeJours - this.congesRestants);
  }

  // ── Certificate upload ──────────────────────────────────
  onCertificatSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.certificatMedical = input.files?.[0] ?? null;
    this.certError = false;
    this.cdr.markForCheck();
  }

  removeCertificat(): void {
    this.certificatMedical = null;
    this.cdr.markForCheck();
  }

  // ── General attachments ─────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.files = Array.from(input.files);
  }

  removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
  }

  // ── Submit ──────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    // Mandatory certificate for MALADIE
    if (this.isMaladie && !this.certificatMedical) {
      this.certError = true;
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.errorMsg = null;

    const val = this.form.value;
    const dto: CreateDemandeDTO = {
      type       : val.type as any,
      description: val.description!,
      dateDebut  : this.requiresDates ? (val.dateDebut || null) : null,
      dateFin    : this.requiresDates ? (val.dateFin   || null) : null
    };

    this.demandeService.createDemande(dto).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/employe/demandes']);
      },
      error: () => {
        this.isSaving = false;
        this.errorMsg = 'Erreur lors de l\'envoi. Veuillez réessayer.';
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void { this.router.navigate(['/employe/demandes']); }
}
