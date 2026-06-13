export interface Departement {
  id              : number;
  nom             : string;
  responsable     : string;
  responsablePhoto?: string;
  telephone       : string;
  email           : string;
  capacite        : number;
  anneeCreation   : number;
  totalEmployes   : number;
  description    ?: string;
}
