export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  telephone?: string;
  dateEmbauche?: string;
  poste?: string;
  departement?: string;
  chefId?: number;
}