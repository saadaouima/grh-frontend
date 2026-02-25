import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
//import { Client } from '@stomp/stompjs';

export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  icone: string;
  heure: Date;
  lue: boolean;
  lien?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, SharedModule, BreadcrumbComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  // private client!: Client;

  notifications: Notification[] = [];
  filtreActif: 'toutes' | 'non-lues' | 'info' | 'success' | 'warning' | 'danger' = 'toutes';

  filtres = [
    { value: 'toutes',   label: 'Toutes',     icone: 'ti ti-bell'          },
    { value: 'non-lues', label: 'Non lues',   icone: 'ti ti-bell-ringing'  },
    { value: 'success',  label: 'Succès',     icone: 'ti ti-circle-check'  },
    { value: 'warning',  label: 'Alertes',    icone: 'ti ti-alert-triangle' },
    { value: 'danger',   label: 'Urgentes',   icone: 'ti ti-alert-circle'  }
  ];

  ngOnInit(): void {
    this.loadFakeData();
    // this.connectStomp();
  }

  /*
  connectStomp(): void {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000
    });
    this.client.onConnect = () => {
      this.client.subscribe('/topic/notifications', (msg) => {
        const notif: Notification = JSON.parse(msg.body);
        this.notifications.unshift(notif);
      });
    };
    this.client.activate();
  }
  */

  loadFakeData(): void {
    const now = new Date();
    const h = (minus: number) => new Date(now.getTime() - minus * 60000);

    this.notifications = [
      {
        id: 1,
        titre: 'Demande de congé soumise',
        message: 'Sami Ben Ali a soumis une demande de congé du 01/03 au 05/03.',
        type: 'info',
        icone: 'ti ti-calendar-event',
        heure: h(5),
        lue: false,
        lien: '/chef/demandes'
      },
      {
        id: 2,
        titre: 'Projet terminé avec succès',
        message: 'Le projet "Portail Fournisseurs" est marqué comme terminé à 100%.',
        type: 'success',
        icone: 'ti ti-circle-check',
        heure: h(30),
        lue: false,
        lien: '/chef/projets'
      },
      {
        id: 3,
        titre: 'Tâche en retard',
        message: 'La tâche "Config infrastructure" est en retard de 3 jours.',
        type: 'warning',
        icone: 'ti ti-alert-triangle',
        heure: h(60),
        lue: false,
        lien: '/chef/taches'
      },
      {
        id: 4,
        titre: 'Nouveau message de Ines Trabelsi',
        message: 'Les maquettes Figma sont finalisées et prêtes pour révision.',
        type: 'info',
        icone: 'ti ti-message-circle',
        heure: h(90),
        lue: true,
        lien: '/chat'
      },
      {
        id: 5,
        titre: 'Délai projet critique dépassé',
        message: 'Le projet "Tableau de Bord Analytics" dépasse son délai prévu.',
        type: 'danger',
        icone: 'ti ti-alert-circle',
        heure: h(120),
        lue: false,
        lien: '/chef/projets'
      },
      {
        id: 6,
        titre: 'Rapport sprint validé',
        message: 'Le rapport du sprint 3 a été validé et archivé.',
        type: 'success',
        icone: 'ti ti-file-check',
        heure: h(180),
        lue: true
      },
      {
        id: 7,
        titre: 'Demande de formation soumise',
        message: 'Mohamed Gharbi a soumis une demande de formation Angular avancé.',
        type: 'info',
        icone: 'ti ti-school',
        heure: h(240),
        lue: true,
        lien: '/chef/demandes'
      },
      {
        id: 8,
        titre: 'Pipeline déployé avec succès',
        message: 'Youssef Hammami a déployé la version 2.3.1 en production.',
        type: 'success',
        icone: 'ti ti-rocket',
        heure: h(300),
        lue: true
      }
    ];
  }

  // ── Filtres ────────────────────────────────────────────
  setFiltre(f: string): void {
    this.filtreActif = f as 'toutes' | 'non-lues' | 'info' | 'success' | 'warning' | 'danger';
  }

  get notificationsFiltrees(): Notification[] {
    if (this.filtreActif === 'toutes')    return this.notifications;
    if (this.filtreActif === 'non-lues')  return this.notifications.filter(n => !n.lue);
    return this.notifications.filter(n => n.type === this.filtreActif);
  }

  get totalNonLues(): number {
    return this.notifications.filter(n => !n.lue).length;
  }

  // ── Actions ────────────────────────────────────────────
  marquerLue(notif: Notification): void {
    notif.lue = true;
  }

  marquerToutesLues(): void {
    this.notifications.forEach(n => n.lue = true);
  }

  supprimerNotif(notif: Notification, event: Event): void {
    event.stopPropagation();
    this.notifications = this.notifications.filter(n => n.id !== notif.id);
  }

  supprimerToutes(): void {
    if (!confirm('Supprimer toutes les notifications ?')) return;
    this.notifications = [];
  }

  tempsRelatif(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1)   return 'À l\'instant';
    if (diff < 60)  return `Il y a ${diff} min`;
    const h = Math.floor(diff / 60);
    if (h < 24)    return `Il y a ${h}h`;
    return `Il y a ${Math.floor(h / 24)}j`;
  }
}