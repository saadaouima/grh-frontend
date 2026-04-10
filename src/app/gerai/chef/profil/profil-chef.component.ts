// Angular Import
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { ProfilEmploye, DocumentEmploye, ActiviteEmploye, StatistiquesEmploye, ProfilComplet, UpdateProfilDTO } from '../../models/employe-profile.model';
import { ProfilEmployeService } from '../../services/employe-profile.service';


@Component({
  selector: 'app-profil-chef',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CardComponent
  ],
  templateUrl: './profil-chef.component.html',
  styleUrls: ['./profil-chef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilChefComponent implements OnInit {

  
  editMode = false;

  userInfo!: ProfilEmploye;
  private userInfoBackup!: ProfilEmploye;

  documents: DocumentEmploye[] = [];
  activities: ActiviteEmploye[] = [];
  stats!: StatistiquesEmploye;

  constructor(private profilService: ProfilEmployeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadProfilComplet();
  }

  // ── Load Data ───────────────────────────────────────
  loadProfilComplet(): void {
    this.profilService.getProfilComplet().subscribe({
      next: (data: ProfilComplet) => {
        this.userInfo = data.profil;
        this.userInfoBackup = { ...data.profil };
        this.documents = data.documents;
        this.activities = data.activites;
        this.stats = data.statistiques;
        this.cdr.markForCheck();
      },
      error: err => console.error('Erreur chargement profil complet', err)
    });
  }

  toggleEditMode(): void {
    if (this.editMode) {
      this.userInfo = { ...this.userInfoBackup };
    } else {
      this.userInfoBackup = { ...this.userInfo };
    }
    this.editMode = !this.editMode;
  }

  saveProfile(): void {
    const updates: UpdateProfilDTO = { ...this.userInfo };
    this.profilService.updateProfil(updates).subscribe({
      next: updated => {
        this.userInfo = updated;
        this.userInfoBackup = { ...updated };
        this.editMode = false;
        this.cdr.markForCheck();
        alert('Profil mis à jour avec succès (mock/local) !');
      },
      error: err => {
        console.error('Erreur mise à jour profil', err);
        alert('Échec de la mise à jour du profil');
      }
    });
  }

  // ── Document Actions ────────────────────────────────
  uploadDocument(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      const file = (input.files as FileList)[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        this.profilService.uploadDocument(formData).subscribe({
          next: doc => { this.documents.push(doc); this.cdr.markForCheck(); },
          error: err => console.error('Erreur upload document', err)
        });
      }
    };
    input.click();
  }


  viewDocument(docId: number): void {
    this.profilService.viewDocument(docId);
  }

  downloadDocument(docId: number): void {
    const doc = this.documents.find(d => d.id === docId);
    this.profilService.forceDownload(docId, doc?.nom);
  }

  deleteDocument(docId: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce document ?')) {
      this.profilService.deleteDocument(docId).subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== docId);
          this.cdr.markForCheck();
        },
        error: err => console.error('Erreur suppression document', err)
      });
    }
  }


}