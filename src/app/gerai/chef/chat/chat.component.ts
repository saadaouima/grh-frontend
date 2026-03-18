import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule }        from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
// // import { Client } from '@stomp/stompjs'; // décommenter quand le back est prêt // ← décommenter après: npm install @stomp/stompjs

export interface ChatMessage {
  id: number;
  auteur: string;
  initiales: string;
  contenu: string;
  heure: Date;
  estMoi: boolean;
  avatar?: string;
}

export interface Contact {
  id: number;
  nom: string;
  initiales: string;
  poste: string;
  statut: 'en-ligne' | 'absent' | 'hors-ligne';
  dernierMessage?: string;
  nonLus: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, SharedModule, BreadcrumbComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // private client!: Client; // STOMP — décommenter après install

  // ── État ──────────────────────────────────────────────
  contacts: Contact[] = [];
  contactActif: Contact | null = null;
  messages: ChatMessage[] = [];
  tousMessages: Record<number, ChatMessage[]> = {};
  newMessage = '';
  recherche = '';
  private shouldScroll = false;

  moi = { nom: 'Ahmed Mansour', initiales: 'AM' };

  // ── Lifecycle ──────────────────────────────────────────
  ngOnInit(): void {
    this.loadFakeData();
    this.selectContact(this.contacts[0]);
    // this.connectStomp(); // ← décommenter quand le back est prêt
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  // ── STOMP (prêt à activer) ─────────────────────────────
  /*
  connectStomp(): void {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000
    });
    this.client.onConnect = () => {
      this.client.subscribe('/topic/chat', (msg) => {
        const data: ChatMessage = JSON.parse(msg.body);
        if (this.contactActif && data.auteur !== this.moi.nom) {
          this.messages.push(data);
          this.shouldScroll = true;
        }
      });
    };
    this.client.activate();
  }
  */

  // ── Fake data ─────────────────────────────────────────
  loadFakeData(): void {
    this.contacts = [
      { id: 1, nom: 'Sami Ben Ali',    initiales: 'SB', poste: 'Développeur',  statut: 'en-ligne', dernierMessage: 'Le rapport est prêt',     nonLus: 2 },
      { id: 2, nom: 'Ines Trabelsi',   initiales: 'IT', poste: 'Designer',     statut: 'en-ligne', dernierMessage: 'Maquettes envoyées ✓',    nonLus: 0 },
      { id: 3, nom: 'Mohamed Gharbi',  initiales: 'MG', poste: 'Analyste',     statut: 'absent',   dernierMessage: 'Je reviens dans 30 min',  nonLus: 1 },
      { id: 4, nom: 'Leila Sassi',     initiales: 'LS', poste: 'Testeur',      statut: 'hors-ligne',dernierMessage: 'Tests terminés',          nonLus: 0 },
      { id: 5, nom: 'Youssef Hammami', initiales: 'YH', poste: 'DevOps',       statut: 'en-ligne', dernierMessage: 'Pipeline déployé 🚀',     nonLus: 0 }
    ];

    const now = new Date();
    const h = (minus: number) => new Date(now.getTime() - minus * 60000);

    this.tousMessages = {
      1: [
        { id: 1, auteur: 'Sami Ben Ali',   initiales: 'SB', contenu: 'Bonjour chef, le rapport sprint est terminé.',         heure: h(45), estMoi: false },
        { id: 2, auteur: this.moi.nom,      initiales: 'AM', contenu: 'Parfait, je le consulte maintenant.',                  heure: h(40), estMoi: true  },
        { id: 3, auteur: 'Sami Ben Ali',   initiales: 'SB', contenu: 'Il y a quelques points à discuter sur la partie API.', heure: h(30), estMoi: false },
        { id: 4, auteur: this.moi.nom,      initiales: 'AM', contenu: 'On se fait un appel à 14h ?',                         heure: h(20), estMoi: true  },
        { id: 5, auteur: 'Sami Ben Ali',   initiales: 'SB', contenu: 'Le rapport est prêt, j\'attends votre retour.',        heure: h(5),  estMoi: false }
      ],
      2: [
        { id: 1, auteur: 'Ines Trabelsi',  initiales: 'IT', contenu: 'Les maquettes Figma sont finalisées.',                 heure: h(120), estMoi: false },
        { id: 2, auteur: this.moi.nom,     initiales: 'AM', contenu: 'Excellent travail Ines !',                             heure: h(100), estMoi: true  },
        { id: 3, auteur: 'Ines Trabelsi',  initiales: 'IT', contenu: 'Maquettes envoyées ✓',                                heure: h(90),  estMoi: false }
      ],
      3: [
        { id: 1, auteur: 'Mohamed Gharbi', initiales: 'MG', contenu: 'Analyse des besoins terminée pour le module RH.',     heure: h(200), estMoi: false },
        { id: 2, auteur: this.moi.nom,     initiales: 'AM', contenu: 'Merci Mohamed, très complet.',                        heure: h(180), estMoi: true  },
        { id: 3, auteur: 'Mohamed Gharbi', initiales: 'MG', contenu: 'Je reviens dans 30 min pour la réunion.',             heure: h(15),  estMoi: false }
      ],
      4: [{ id: 1, auteur: 'Leila Sassi',  initiales: 'LS', contenu: 'Tests terminés, 0 bug critique.', heure: h(300), estMoi: false }],
      5: [{ id: 1, auteur: 'Youssef Hammami', initiales: 'YH', contenu: 'Pipeline déployé 🚀 tout est vert.', heure: h(60), estMoi: false }]
    };
  }

  // ── Actions ────────────────────────────────────────────
  selectContact(contact: Contact): void {
    this.contactActif = contact;
    this.messages = this.tousMessages[contact.id] ?? [];
    contact.nonLus = 0;
    this.shouldScroll = true;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.contactActif) return;

    const msg: ChatMessage = {
      id: Date.now(),
      auteur: this.moi.nom,
      initiales: this.moi.initiales,
      contenu: this.newMessage.trim(),
      heure: new Date(),
      estMoi: true
    };

    this.messages.push(msg);
    if (!this.tousMessages[this.contactActif.id]) {
      this.tousMessages[this.contactActif.id] = [];
    }
    this.tousMessages[this.contactActif.id].push(msg);
    this.contactActif.dernierMessage = msg.contenu;

    // En prod : this.client.publish({ destination: '/app/chat', body: JSON.stringify(msg) });

    this.newMessage = '';
    this.shouldScroll = true;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  get contactsFiltres(): Contact[] {
    if (!this.recherche.trim()) return this.contacts;
    return this.contacts.filter(c =>
      c.nom.toLowerCase().includes(this.recherche.toLowerCase())
    );
  }

  get totalNonLus(): number {
    return this.contacts.reduce((sum, c) => sum + c.nonLus, 0);
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch { /* scroll unavailable */ }
  }
}