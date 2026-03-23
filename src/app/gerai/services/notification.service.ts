import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Notification } from '../../theme/shared/interfaces/notification';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/notifications`;

    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/mes-notifications`);
    }
    marquerCommeLue(id: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/marquer-comme-lue`, {});
    }
}