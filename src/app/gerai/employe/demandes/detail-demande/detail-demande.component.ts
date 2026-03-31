import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface Demande {
  id: number;
  type: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  statut: string;
  statutLabel: string;
  commentaireRh: string;
  documents: { nom: string; url: string }[];
}

@Component({
  selector: 'app-detail-demande',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-demande.component.html',
  styleUrls: ['./detail-demande.component.scss']
})
export class DetailDemandeComponent implements OnInit {
  private route = inject(ActivatedRoute);

  demandeId!: number;
  demande!: Demande;
  timeline: { label: string; icon: string; active: boolean }[] = [];

  ngOnInit(): void {
    this.demandeId = Number(this.route.snapshot.paramMap.get('id'));

    // ⚠️ Mock temporaire (à remplacer par API)
    this.demande = {
      id: this.demandeId,
      type: 'Congé',
      description: 'Congé annuel',
      dateDebut: new Date('2024-03-01'),
      dateFin: new Date('2024-03-10'),
      statut: 'REFUSEE',
      statutLabel: 'Refusée',
      commentaireRh: 'Demande refusée car chevauche une période critique',
      documents: [
        { nom: 'Justificatif.pdf', url: '/assets/docs/justificatif.pdf' }
      ]
    };

    this.timeline = [
      { label: 'Soumise', icon: 'ti ti-send', active: true },
      { label: 'En cours', icon: 'ti ti-clock', active: true },
      { label: this.demande.statutLabel, icon: this.demande.statut === 'VALIDEE' ? 'ti ti-check' : 'ti ti-x', active: true }
    ];
  }
}
