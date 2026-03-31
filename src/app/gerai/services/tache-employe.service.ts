// ✅ Injectable et inject viennent de @angular/core
import { Injectable, inject } from '@angular/core';

// ✅ HttpClient vient de @angular/common/http
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TacheKanban } from 'src/app/gerai/models/tache.model';
@Injectable({ providedIn: 'root' })
export class TacheService {
    private http = inject(HttpClient);
    private API = '/api/taches';

    getTaches(): Observable<TacheKanban[]> {
        return this.http.get<TacheKanban[]>(this.API);
    }

    updateTache(id: number, changes: Partial<TacheKanban>): Observable<TacheKanban> {
        return this.http.patch<TacheKanban>(`${this.API}/${id}`, changes);
    }
}