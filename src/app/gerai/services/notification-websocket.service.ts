import { Injectable, OnDestroy, NgZone, inject } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { Notification } from 'src/app/gerai/models/notification.model';
import { UserRole } from 'src/app/gerai/models/user-role.type';
import {
    NOTIFICATIONS_TEMPLATES,
    NOMS_EMPLOYES,
    PROJETS,
    TACHES
} from 'src/app/mocks/data/notifications.mock';

@Injectable({ providedIn: 'root' })
export class NotificationWebSocketService implements OnDestroy {

    /* ────────────────────────────────────────────────
       💉 INJECTIONS
       ──────────────────────────────────────────────── */
    private zone = inject(NgZone);

    /* ────────────────────────────────────────────────
       📡 ÉTAT INTERNE
       ──────────────────────────────────────────────── */
    private simulationSub?: Subscription;
    private isConnected = false;
    private roleActif: UserRole | null = null;
    private nextId = 10_000;

    /* ────────────────────────────────────────────────
       📢 STREAMS PUBLICS
       ──────────────────────────────────────────────── */
    readonly nouvelleNotification$ = new Subject<Notification>();
    readonly connecte$ = new Subject<boolean>();

    /* ══════════════════════════════════════════════════════════
       🔌 CONNEXION
       ══════════════════════════════════════════════════════════ */

    /**
     * Simule une connexion WebSocket (Kafka topic par rôle)
     */
    connect(role: UserRole): void {

        // Si déjà connecté avec le même rôle → on ignore
        if (this.isConnected && this.roleActif === role) {
            return;
        }

        // Si connecté avec autre rôle → on reconnecte proprement
        if (this.isConnected && this.roleActif !== role) {
            this.disconnect();
        }

        this.roleActif = role;
        this.isConnected = true;

        this.zone.run(() => this.connecte$.next(true));

        console.info(
            `[NotifWS] 🔌 Connecté (simulation) — topic: notifications.${role.toLowerCase()}`
        );

        // Simulation toutes les 45 secondes
        this.simulationSub = interval(45_000).subscribe(() => {

            // 65% de probabilité d’envoi
            if (Math.random() < 0.65) {
                this.zone.run(() => this._genererNotification());
            }
        });
    }

    /* ══════════════════════════════════════════════════════════
       🎲 GÉNÉRATION
       ══════════════════════════════════════════════════════════ */

    private _genererNotification(): void {

        if (!this.roleActif) return;

        /**
         * Templates :
         * - role === undefined → global
         * - role === roleActif → spécifique
         */
        const pool = NOTIFICATIONS_TEMPLATES.filter(template =>
            !template.role || template.role === this.roleActif
        );

        if (!pool.length) return;

        const template = pool[Math.floor(Math.random() * pool.length)];
        const detail = this._resolveDetail(template.titre);

        const notification: Notification = {
            id: this.nextId++,
            titre: template.titre,
            message: template.message(detail),
            type: template.type,
            icone: template.icone,
            heure: new Date().toISOString(),
            lue: false,
            lien: template.lien ?? null,
            role: template.role ?? this.roleActif
        };

        console.debug(
            `[NotifWS] 📩 topic:notifications.${this.roleActif.toLowerCase()} →`,
            notification.titre
        );

        this.nouvelleNotification$.next(notification);
    }

    /* ══════════════════════════════════════════════════════════
       🔍 CONTEXTE DYNAMIQUE
       ══════════════════════════════════════════════════════════ */

    private _resolveDetail(titre: string): string {

        const lower = titre.toLowerCase();

        if (lower.includes('projet')) {
            return PROJETS[Math.floor(Math.random() * PROJETS.length)];
        }

        if (lower.includes('tâche')) {
            return TACHES[Math.floor(Math.random() * TACHES.length)];
        }

        if (lower.includes('demande')) {
            return NOMS_EMPLOYES[Math.floor(Math.random() * NOMS_EMPLOYES.length)];
        }

        return NOMS_EMPLOYES[Math.floor(Math.random() * NOMS_EMPLOYES.length)];
    }

    /* ══════════════════════════════════════════════════════════
       🧪 MÉTHODE DE TEST (Console Dev)
       ══════════════════════════════════════════════════════════ */

    envoyerNotificationTest(type: Notification['type'] = 'info'): void {

        if (!this.roleActif) return;

        const pool = NOTIFICATIONS_TEMPLATES.filter(template =>
            (!template.role || template.role === this.roleActif) &&
            template.type === type
        );

        if (!pool.length) return;

        const template = pool[0];

        const notification: Notification = {
            id: this.nextId++,
            titre: template.titre,
            message: template.message('Utilisateur Test'),
            type: template.type,
            icone: template.icone,
            heure: new Date().toISOString(),
            lue: false,
            lien: template.lien ?? null,
            role: template.role ?? this.roleActif
        };

        console.info(`[NotifWS] 🧪 Notification de test (${type})`);

        this.zone.run(() => this.nouvelleNotification$.next(notification));
    }

    /* ══════════════════════════════════════════════════════════
       🔌 DÉCONNEXION
       ══════════════════════════════════════════════════════════ */

    disconnect(): void {

        this.simulationSub?.unsubscribe();
        this.simulationSub = undefined;

        this.isConnected = false;
        this.roleActif = null;

        this.zone.run(() => this.connecte$.next(false));

        console.info('[NotifWS] ❌ Déconnecté');
    }

    /* ══════════════════════════════════════════════════════════
       🧹 CLEANUP
       ══════════════════════════════════════════════════════════ */

    ngOnDestroy(): void {
        this.disconnect();
    }
}