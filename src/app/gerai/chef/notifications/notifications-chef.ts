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
  selector: 'app-notifications-chef',
  standalone: true,
  imports: [CommonModule, SharedModule, BreadcrumbComponent],
  templateUrl: './notifications-chef.html',
  styleUrls: ['./notifications-chef.scss']
})
export class NotificationsChef implements OnInit, OnDestroy {
  role: UserRole = 'CHEF';
  /* ──────────────────────────────────────────────────────────
     💉 SERVICES INJECTÉS
     ────────────────────────────────────────────────────────── */
  private notifService = inject(NotificationService);
  private wsService = inject(NotificationWebSocketService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private subs: Subscription[] = [];

  /* ──────────────────────────────────────────────────────────
     📊 ÉTAT DU COMPOSANT
     ────────────────────────────────────────────────────────── */
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

  /* ══════════════════════════════════════════════════════════════
     🔄 LIFECYCLE
     ══════════════════════════════════════════════════════════════ */

  ngOnInit(): void {
    console.log('🔔 [Notifications] Initialisation...');
    this._chargerNotifications();
    this._connecterWebSocket();
  }

  ngOnDestroy(): void {
    console.log('🛑 [Notifications] Destruction...');
    this.subs.forEach(s => s.unsubscribe());
    this.wsService.disconnect();
  }

  /* ══════════════════════════════════════════════════════════════
     📡 CHARGEMENT INITIAL
     ══════════════════════════════════════════════════════════════ */

  /**
   * Charge les notifications existantes (sans loading visible)
   */
  private _chargerNotifications(): void {
    this.notifService.notifications$.subscribe({
      next: (data) => {
        this.notifications = data.map(n => ({
          ...n,
          tempsAffiche: this.tempsRelatif(n.heure)
        }));
        console.log('✅ [Notifications]', this.notifications.length, 'chargées');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ [Notifications] Erreur chargement:', err);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     🔌 WEBSOCKET - TEMPS RÉEL
     ══════════════════════════════════════════════════════════════ */

  /**
   * Connecte au WebSocket pour recevoir les notifications en temps réel
   */
  private _connecterWebSocket(): void {
    console.log('🔌 [Notifications] Connexion WebSocket...');
    this.wsService.connect(this.role);

    // S'abonner aux nouvelles notifications
    this.subs.push(
      this.wsService.nouvelleNotification$.subscribe((notif: Notification) => {
        console.log('🔔 [Notifications] Nouvelle notification reçue:', notif.titre);

        // Ajouter au début de la liste
        const notifAvecTemps = {
          ...notif,
          tempsAffiche: this.tempsRelatif(notif.heure)
        };

        this.notifications.unshift(notifAvecTemps);

        // Afficher le toast
        this.derniereNotification = notif;
        this.afficherToast = true;

        // Masquer le toast après 5 secondes
        setTimeout(() => {
          this.afficherToast = false;
          this.cdr.detectChanges();
        }, 5000);

        this.cdr.detectChanges();
      })
    );

    // Statut de connexion
    this.subs.push(
      this.wsService.connecte$.subscribe((connecte: boolean) => {
        console.log('🔌 [Notifications] WebSocket', connecte ? 'connecté' : 'déconnecté');
      })
    );
  }

  /* ══════════════════════════════════════════════════════════════
     📊 GETTERS
     ══════════════════════════════════════════════════════════════ */

  /**
   * Nombre de notifications non lues
   */
  get totalNonLues(): number {
    return this.notifications.filter(n => !n.lue).length;
  }

  /**
   * Notifications filtrées selon l'onglet actif
   */
  get notificationsFiltrees(): Notification[] {
    if (this.filtreActif === 'toutes') {
      return this.notifications;
    }

    if (this.filtreActif === 'non-lues') {
      return this.notifications.filter(n => !n.lue);
    }

    return this.notifications.filter(n => n.type === this.filtreActif);
  }

  /**
   * Nombre de notifications par filtre (pour les badges)
   */
  getNombreParFiltre(filtre: string): number {
    if (filtre === 'toutes') return this.notifications.length;
    if (filtre === 'non-lues') return this.totalNonLues;
    return this.notifications.filter(n => n.type === filtre).length;
  }

  /* ══════════════════════════════════════════════════════════════
     🎬 ACTIONS
     ══════════════════════════════════════════════════════════════ */

  /**
   * Change le filtre actif
   */
  setFiltre(filtre: string): void {
    this.filtreActif = filtre;
    this.cdr.detectChanges();
  }

  /**
   * Marque une notification comme lue
   */
  marquerLue(notif: Notification): void {
    if (notif.lue) return; // Déjà lue

    this.notifService.markAsRead(notif.id).subscribe({
      next: () => {
        notif.lue = true;
        console.log('✅ [Notifications] Notification', notif.id, 'marquée lue');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ [Notifications] Erreur marquage lecture:', err);
      }
    });
  }

  /**
   * Marque toutes les notifications comme lues
   */
  marquerToutesLues(): void {
    const nonLues = this.totalNonLues;
    if (nonLues === 0) return;

    this.notifService.markAllAsRead('CHEF').subscribe({
      next: () => {
        this.notifications.forEach(n => n.lue = true);
        console.log('✅ [Notifications]', nonLues, 'notifications marquées lues');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ [Notifications] Erreur marquage global:', err);
      }
    });
  }

  /**
   * Supprime une notification
   */
  supprimerNotif(notif: Notification, event: Event): void {
    event.stopPropagation(); // Éviter de marquer comme lue

    this.notifService.deleteNotification(notif.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        console.log('🗑️ [Notifications] Notification', notif.id, 'supprimée');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ [Notifications] Erreur suppression:', err);
      }
    });
  }

  /**
   * Supprime toutes les notifications
   */
  supprimerToutes(): void {
    if (this.notifications.length === 0) return;

    if (!confirm(`Supprimer toutes les ${this.notifications.length} notifications ?`)) {
      return;
    }

    this.notifService.deleteAll(this.role).subscribe({
      next: () => {
        const count = this.notifications.length;
        this.notifications = [];
        console.log('🗑️ [Notifications]', count, 'notifications supprimées');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ [Notifications] Erreur suppression globale:', err);
      }
    });
  }

  /**
   * Ouvre le lien associé à une notification
   */
  ouvrirLien(notif: Notification, event: Event): void {
    event.stopPropagation();

    console.log('──────────── DEBUG NAVIGATION CHEF ────────────');
    console.log('Route actuelle:', this.router.url);
    console.log('Lien reçu:', notif.lien);
    console.log('Rôle actif:', this.role);
    console.log('───────────────────────────────────────────────');

    if (!notif.lue) {
      this.marquerLue(notif);
    }

    if (!notif.lien) return;

    // 🔒 Sécurité : forcer les liens chef
    let lien = notif.lien;

    if (!lien.startsWith('/chef')) {
      console.warn('⚠ Lien non chef détecté, correction automatique');
      lien = `/chef${lien.startsWith('/') ? lien : '/' + lien}`;
    }

    this.router.navigate([lien]);
  }
  /**
   * Ferme le toast de notification
   */
  fermerToast(): void {
    this.afficherToast = false;
    this.cdr.detectChanges();
  }

  /* ══════════════════════════════════════════════════════════════
     🛠️ HELPERS
     ══════════════════════════════════════════════════════════════ */

  /**
   * Calcule le temps relatif depuis une date
   */
  tempsRelatif(dateStr: string | Date): string {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 60000); // Différence en minutes

    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;

    const heures = Math.floor(diff / 60);
    if (heures < 24) return `Il y a ${heures}h`;

    const jours = Math.floor(heures / 24);
    if (jours === 1) return "Hier";
    if (jours < 7) return `Il y a ${jours}j`;

    return `Il y a ${Math.floor(jours / 7)} sem`;
  }

  /**
   * Retourne la classe CSS selon le type de notification
   */
  getClasseType(type: string): string {
    return `notif-${type}`;
  }

  /* ══════════════════════════════════════════════════════════════
     🧪 MÉTHODES DE TEST (pour debug)
     ══════════════════════════════════════════════════════════════ */

  /**
   * Force l'envoi d'une notification de test
   * À utiliser dans la console: window['notifComponent'].envoyerNotificationTest()
   */
  envoyerNotificationTest(type: Notification['type'] = 'info'): void {
    this.wsService.envoyerNotificationTest(type);
  }
}

// Exposer le composant pour debug (développement uniquement)
if (typeof window !== 'undefined') {
  (window as any)['notifComponent'] = null;
}
