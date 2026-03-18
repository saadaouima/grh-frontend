import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-deposer-demande',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './deposer-demande.component.html',
  styleUrls: ['./deposer-demande.component.scss']
})
export class DeposerDemandeComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    type: ['', Validators.required],
    description: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required]
  });

  files: File[] = [];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = Array.from(input.files);
    }
  }

  submit(): void {
    if (this.form.valid) {
      console.log('Demande envoyée :', this.form.value, 'Pièces jointes:', this.files);
      // TODO: appel API backend
    } else {
      this.form.markAllAsTouched();
    }
  }
}
