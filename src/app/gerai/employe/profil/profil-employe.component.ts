// Angular Import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

// ─── Interfaces ─────────────────────────────────────────────────────────────
export interface UserInfo {
  nom: string;
  prenom: string;
  photo: string;
  poste: string;
  departement: string;
  email: string;
  telephone: string;
  dateNaissance: Date;
  lieuNaissance: string;
  adresse: string;
  ville: string;
  codePostal: string;
  anciennete: string;
  congesRestants: number;
  tachesCompletes: number;
}

export interface DocumentFile {
  id: number;
  nom: string;
  type: 'pdf' | 'excel' | 'word';
  taille: string;
  dateAjout: Date;
  url?: string;
}

export interface Activity {
  id: number;
  titre: string;
  description: string;
  date: Date;
  type: 'demande' | 'tache' | 'formation' | 'document';
  badge?: string;
}

@Component({
  selector: 'app-profil-employe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CardComponent
  ],
  templateUrl: './profil-employe.component.html',
  styleUrls: ['./profil-employe.component.scss']
})
export class ProfilEmployeComponent implements OnInit {

  // ── Edit Mode ───────────────────────────────────────
  editMode: boolean = false;

  // ── User Info ───────────────────────────────────────
  userInfo: UserInfo = {
    nom: 'BOUSSAIDI',
    prenom: 'Nour El Houda',
    photo: 'assets/images/user/avatar-1.jpg',
    poste: 'Développeur Full Stack',
    departement: 'IT - Développement',
    email: 'nourelhouda.boussaidi.2023@ihec.ucar.tn',
    telephone: '+216 12 345 678',
    dateNaissance: new Date('1995-05-15'),
    lieuNaissance: 'Tunis',
    adresse: '123 Avenue Habib Bourguiba',
    ville: 'Tunis',
    codePostal: '1000',
    anciennete: '2 ans',
    congesRestants: 15,
    tachesCompletes: 42
  };

  // Backup pour annuler les modifications
  private userInfoBackup!: UserInfo;

  // ── Documents ───────────────────────────────────────
  documents: DocumentFile[] = [];

  // ── Activities ──────────────────────────────────────
  activities: Activity[] = [];

  // ── Lifecycle ───────────────────────────────────────
  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDocuments();
    this.loadActivities();
  }

  // ── Load Data ───────────────────────────────────────
  loadUserInfo(): void {
    // TODO: Appel API pour récupérer les infos utilisateur
    // this.userService.getMyProfile().subscribe(...)
    
    // Sauvegarde pour annulation
    this.userInfoBackup = { ...this.userInfo };
  }

  loadDocuments(): void {
    // TODO: Appel API pour récupérer les documents
    this.documents = [
      {
        id: 1,
        nom: 'CV_NourElHouda_2024.pdf',
        type: 'pdf',
        taille: '245 KB',
        dateAjout: new Date('2024-01-15')
      },
      {
        id: 2,
        nom: 'Contrat_de_travail.pdf',
        type: 'pdf',
        taille: '1.2 MB',
        dateAjout: new Date('2024-01-10')
      },
      {
        id: 3,
        nom: 'Attestation_travail.pdf',
        type: 'pdf',
        taille: '180 KB',
        dateAjout: new Date('2024-02-01')
      },
      {
        id: 4,
        nom: 'Fiche_paie_janvier.pdf',
        type: 'pdf',
        taille: '320 KB',
        dateAjout: new Date('2024-02-05')
      }
    ];
  }

  loadActivities(): void {
    // TODO: Appel API pour récupérer l'historique
    this.activities = [
      {
        id: 1,
        titre: 'Demande de congé validée',
        description: 'Votre demande de congé du 01/03 au 10/03 a été approuvée par votre manager.',
        date: new Date('2024-02-20 14:30'),
        type: 'demande',
        badge: 'Validée'
      },
      {
        id: 2,
        titre: 'Tâche terminée',
        description: 'Vous avez marqué la tâche "Intégration API Spring Boot" comme terminée.',
        date: new Date('2024-02-19 16:45'),
        type: 'tache',
        badge: '100%'
      },
      {
        id: 3,
        titre: 'Formation inscrite',
        description: 'Inscription à la formation "Angular Avancé" du 25/02.',
        date: new Date('2024-02-18 10:15'),
        type: 'formation',
        badge: 'Confirmée'
      },
      {
        id: 4,
        titre: 'Document ajouté',
        description: 'Vous avez ajouté le document "Fiche_paie_janvier.pdf".',
        date: new Date('2024-02-05 09:20'),
        type: 'document'
      },
      {
        id: 5,
        titre: 'Demande de formation soumise',
        description: 'Votre demande de formation "React Native" est en attente de validation.',
        date: new Date('2024-02-01 11:00'),
        type: 'demande',
        badge: 'En attente'
      }
    ];
  }

  // ── Edit Mode Toggle ────────────────────────────────
  toggleEditMode(): void {
    if (this.editMode) {
      // Annuler : restaurer les données
      this.userInfo = { ...this.userInfoBackup };
    } else {
      // Activer : sauvegarder l'état actuel
      this.userInfoBackup = { ...this.userInfo };
    }
    this.editMode = !this.editMode;
  }

  // ── Save Profile ────────────────────────────────────
  saveProfile(): void {
    // TODO: Appel API pour sauvegarder
    // this.userService.updateProfile(this.userInfo).subscribe(...)
    
    console.log('Profil sauvegardé:', this.userInfo);
    
    // Simuler succès
    this.userInfoBackup = { ...this.userInfo };
    this.editMode = false;
    
    // TODO: Afficher message de succès avec toast/snackbar
    alert('Profil mis à jour avec succès !');
  }

  // ── Document Actions ────────────────────────────────
  uploadDocument(): void {
    // TODO: Ouvrir dialog upload de fichier
    console.log('Ouvrir dialog upload');
    
    // Simuler ajout document
    const newDoc: DocumentFile = {
      id: this.documents.length + 1,
      nom: 'nouveau_document.pdf',
      type: 'pdf',
      taille: '500 KB',
      dateAjout: new Date()
    };
    
    this.documents.push(newDoc);
  }

  viewDocument(docId: number): void {
    const doc = this.documents.find(d => d.id === docId);
    console.log('Voir document:', doc);
    
    // TODO: Ouvrir le document dans une nouvelle fenêtre ou modal
    // window.open(doc?.url, '_blank');
  }

  downloadDocument(docId: number): void {
    const doc = this.documents.find(d => d.id === docId);
    console.log('Télécharger document:', doc);
    
    // TODO: Déclencher le téléchargement
    // const link = document.createElement('a');
    // link.href = doc?.url || '';
    // link.download = doc?.nom || 'document.pdf';
    // link.click();
  }

  deleteDocument(docId: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce document ?')) {
      console.log('Supprimer document:', docId);
      
      // TODO: Appel API pour supprimer
      // this.documentService.delete(docId).subscribe(...)
      
      this.documents = this.documents.filter(d => d.id !== docId);
    }
  }

}