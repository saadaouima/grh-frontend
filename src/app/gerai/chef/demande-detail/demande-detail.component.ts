import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Demande } from '../../models/demande.model';
import { DemandeService } from '../../services/demande.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demande-detail.component.html',
  styleUrls: ['./demande-detail.component.scss']
})
export class DemandeDetailComponent implements OnInit {
  
  demandeId!: number;
  demande: Demande | null = null;

  constructor(
    private route: ActivatedRoute,
    private demandeService: DemandeService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.demandeId = +idParam;
      this.loadDemande();
    } else {
      console.error('⚠️ Aucun ID trouvé dans l’URL');
    }
  }

  loadDemande(): void {
    this.demandeService.getDemandeById(this.demandeId).subscribe({
      next: (d) => this.demande = d,
      error: (err) => console.error('Erreur lors du chargement de la demande', err)
      }).add(() => this.cd.markForCheck());
  }
}