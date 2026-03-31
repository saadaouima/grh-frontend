import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { Notification } from 'src/app/gerai/models/notification.model';
import { NotificationService } from 'src/app/gerai/services/notification.service';
import { NotificationWebSocketService } from 'src/app/gerai/services/notification-websocket.service';
import { Subscription } from 'rxjs';
import { UserRole } from 'src/app/gerai/models/user-role.type';

@Component({
    selector: 'app-notifications-employe',
    standalone: true,
    imports: [CommonModule, SharedModule, BreadcrumbComponent],
    templateUrl: './notifications-employe.html',
    styleUrls: ['./notifications-employe.scss']
})
export class NotificationsEmploye implements OnInit, OnDestroy {

    // 🔥 IMPORTANT : rôle employé
    role: UserRole = 'EMPLOYE';

    private notifService = inject(NotificationService);
    private wsService = inject(NotificationWebSocketService);
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);
    private subs: Subscription[] = [];

    notifications: Notification[] = [];
    filtreActif: string = 'toutes';
    chargement = false;
    afficherToast = false;
    derniereNotification: Notification | null = null;

    filtres = [
        { value: 'toutes', label: 'Toutes', icone: 'ti ti-bell' },
        { value: 'non-lues', label: 'Non lues', icone: 'ti ti-bell-ringing' },
        { value: 'success', label: 'Succès', icone: 'ti ti-circle-check' },
        { value: 'warning', label: 'Alertes', icone: 'ti ti-alert-triangle' },
        { value: 'danger', label: 'Urgentes', icone: 'ti ti-alert-circle' }
    ];

    /* ================= LIFECYCLE ================= */

    ngOnInit(): void {
        console.log('🔔 [Notifications Employe] Initialisation...');
        this._chargerNotifications();
        this._connecterWebSocket();
    }

    ngOnDestroy(): void {
        console.log('🛑 [Notifications Employe] Destruction...');
        this.subs.forEach(s => s.unsubscribe());
        this.wsService.disconnect();
    }

    /* ================= CHARGEMENT ================= */

    private _chargerNotifications(): void {
        this.notifService.notifications$.subscribe({
            next: (data) => {
                this.notifications = data;
                console.log('✅ [Notifications Employe]', this.notifications.length, 'chargées');
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('❌ [Notifications Employe] Erreur chargement:', err);
            }
        });
    }

    /* ================= WEBSOCKET ================= */

    private _connecterWebSocket(): void {
        this.wsService.connect(this.role);

        this.subs.push(
            this.wsService.nouvelleNotification$.subscribe((notif: Notification) => {

                console.log('🔔 [Notifications Employe] Nouvelle notification:', notif.titre);

                this.notifications.unshift(notif);

                this.derniereNotification = notif;
                this.afficherToast = true;

                setTimeout(() => {
                    this.afficherToast = false;
                    this.cdr.detectChanges();
                }, 5000);

                this.cdr.detectChanges();
            })
        );

        this.subs.push(
            this.wsService.connecte$.subscribe((connecte: boolean) => {
                console.log('🔌 [Notifications Employe] WebSocket', connecte ? 'connecté' : 'déconnecté');
            })
        );
    }

    /* ================= GETTERS ================= */

    get totalNonLues(): number {
        return this.notifications.filter(n => !n.lue).length;
    }

    get notificationsFiltrees(): Notification[] {
        if (this.filtreActif === 'toutes') return this.notifications;
        if (this.filtreActif === 'non-lues') return this.notifications.filter(n => !n.lue);
        return this.notifications.filter(n => n.type === this.filtreActif);
    }

    getNombreParFiltre(filtre: string): number {
        if (filtre === 'toutes') return this.notifications.length;
        if (filtre === 'non-lues') return this.totalNonLues;
        return this.notifications.filter(n => n.type === filtre).length;
    }

    /* ================= ACTIONS ================= */

    setFiltre(filtre: string): void {
        this.filtreActif = filtre;
    }

    marquerLue(notif: Notification): void {
        if (notif.lue) return;

        this.notifService.markAsRead(notif.id).subscribe({
            next: () => {
                notif.lue = true;
                this.cdr.detectChanges();
            }
        });
    }

    marquerToutesLues(): void {
        if (this.totalNonLues === 0) return;

        this.notifService.markAllAsRead('EMPLOYE').subscribe(() => {
            this.notifications.forEach(n => n.lue = true);
            this.cdr.detectChanges();
        });
    }

    supprimerNotif(notif: Notification, event: Event): void {
        event.stopPropagation();

        this.notifService.deleteNotification(notif.id).subscribe(() => {
            this.notifications = this.notifications.filter(n => n.id !== notif.id);
            this.cdr.detectChanges();
        });
    }

    supprimerToutes(): void {
        if (this.notifications.length === 0) return;

        if (!confirm(`Supprimer toutes les ${this.notifications.length} notifications ?`)) return;

        this.notifService.deleteAll(this.role).subscribe(() => {
            this.notifications = [];
            this.cdr.detectChanges();
        });
    }

    ouvrirLien(notif: Notification, event: Event): void {
        event.stopPropagation();

        if (!notif.lue) this.marquerLue(notif);

        if (notif.lien) {
            this.router.navigate([notif.lien]);
        }
    }

    fermerToast(): void {
        this.afficherToast = false;
    }

    /* ================= HELPERS ================= */

    tempsRelatif(dateStr: string | Date): string {
        const date = new Date(dateStr);
        const diff = Math.floor((Date.now() - date.getTime()) / 60000);

        if (diff < 1) return "À l'instant";
        if (diff < 60) return `Il y a ${diff} min`;

        const heures = Math.floor(diff / 60);
        if (heures < 24) return `Il y a ${heures}h`;

        const jours = Math.floor(heures / 24);
        if (jours === 1) return "Hier";
        if (jours < 7) return `Il y a ${jours}j`;

        return `Il y a ${Math.floor(jours / 7)} sem`;
    }

    getClasseType(type: string): string {
        return `notif-${type}`;
    }

    envoyerNotificationTest(type: Notification['type'] = 'info'): void {
        this.wsService.envoyerNotificationTest(type);
    }
}

/* DEBUG DEV */
if (typeof window !== 'undefined') {
    (window as any)['notifEmployeComponent'] = null;
}