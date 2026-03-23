import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked,
  NgZone, inject, ChangeDetectorRef
} from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { ChatWebSocketService } from 'src/app/gerai/services/ChatWebSocketService';
import { Subscription } from 'rxjs';
import Keycloak from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { ConversationDTO, MessageDTO } from 'src/app/gerai/models/chat.models';

export interface ChatMessage {
  id: number;
  auteur: string;
  initiales: string;
  contenu: string;
  heure: Date;
  estMoi: boolean;
  typeMessage?: 'TEXTE' | 'IMAGE' | 'FICHIER';
  fileUrl?: string;
  fileName?: string;
}

export interface Contact {
  id: number;
  nom: string;
  initiales: string;
  poste: string;
  statut: 'en-ligne' | 'absent' | 'hors-ligne';
  dernierMessage?: string;
  nonLus: number;
  keycloakId: string;
}

const BACK_URL = 'http://localhost:8085';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, SharedModule, BreadcrumbComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private wsService = inject(ChatWebSocketService);
  private keycloak = inject(Keycloak);
  private http = inject(HttpClient);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];

  contacts: Contact[] = [];
  contactsFiltres: Contact[] = [];
  contactActif: Contact | null = null;
  messages: ChatMessage[] = [];
  tousMessages: Record<number, ChatMessage[]> = {};
  newMessage = '';
  recherche = '';
  chargement = false;
  isTyping = false;
  totalNonLus = 0;

  private shouldScroll = false;
  private isSendingTyping = false;
  private stopTypingTimeout: ReturnType<typeof setTimeout> | null = null;
  private serverTypingTimeout: ReturnType<typeof setTimeout> | null = null;
  private typingThrottle: ReturnType<typeof setTimeout> | null = null;

  readonly moi = {
    nom: this.keycloak.tokenParsed?.['name'] ?? 'Moi',
    id: this.keycloak.tokenParsed?.['sub'] ?? ''
  };

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this._chargerContacts();
    this._connecterWebSocket();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.scrollToBottom();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.stopTypingTimeout) clearTimeout(this.stopTypingTimeout);
    if (this.serverTypingTimeout) clearTimeout(this.serverTypingTimeout);
    if (this.typingThrottle) clearTimeout(this.typingThrottle);
    this.wsService.disconnect();
  }

  // ── Contacts ──────────────────────────────────────────
  private _chargerContacts(): void {
    this.http.get<any[]>(`${BACK_URL}/api/chat/users`)
      .subscribe({
        next: (users) => {
          this.contacts = users
            .filter(u => u.id !== this.moi.id)
            .map(u => ({
              id: 0,
              nom: u.nomComplet || u.username,
              initiales: this._initiales(u.nomComplet || u.username),
              poste: 'Employé',
              statut: 'hors-ligne' as const,
              dernierMessage: '',
              nonLus: 0,
              keycloakId: u.id
            }));

          this._majFiltres();
          this._majNonLus();

          if (this.contacts.length > 0) {
            setTimeout(() => this.selectContact(this.contacts[0]));
          }
        },
        error: (err) => console.error('❌ Erreur chargement users:', err)
      });
  }

  onRechercheChange(): void {
    this._majFiltres();
  }

  // ── WebSocket ─────────────────────────────────────────
  private _connecterWebSocket(): void {
    this.wsService.connect();

    // ── Messages reçus
    this.subs.push(
      this.wsService.messageRecu$.subscribe((msg: MessageDTO) => {
        this.zone.run(() => {

          if (!this.tousMessages[msg.conversationId]) {
            this.tousMessages[msg.conversationId] = [];
          }
          const conv = this.tousMessages[msg.conversationId];

          const idxLocal = msg.expediteurId === this.moi.id
            ? conv.findIndex(m => m.contenu === msg.contenu && m.id < 0)
            : -1;

          if (idxLocal !== -1) {
            conv[idxLocal] = this._toLocalMsg(msg);
          } else if (!conv.some(m => m.id === msg.id)) {
            conv.push(this._toLocalMsg(msg));
          }

          this.tousMessages[msg.conversationId] = [...conv];

          if (this.contactActif?.id === msg.conversationId) {
            this.messages = [...conv];
            this.shouldScroll = true;
            if (msg.expediteurId !== this.moi.id) {
              this.isTyping = false;
              if (this.serverTypingTimeout) clearTimeout(this.serverTypingTimeout);
            }
          } else {
            const c = this.contacts.find(ct => ct.keycloakId === msg.expediteurId);
            if (c) {
              c.nonLus++;
              this._majNonLus();
            }
          }

          const estFichier = msg.typeMessage === 'IMAGE' || msg.typeMessage === 'FICHIER';
          this._majDernierMessage(
            msg.expediteurId,
            estFichier ? (msg.fileName ?? 'Fichier') : (msg.contenu ?? ''),
            estFichier
          );

          this.cdr.detectChanges();
        });
      })
    );

    // ── Typing indicator
    this.subs.push(
      this.wsService.typing$.subscribe(t => {
        this.zone.run(() => {
          if (t.expediteurId !== this.contactActif?.keycloakId
            || t.expediteurId === this.moi.id) return;

          if (this.serverTypingTimeout) clearTimeout(this.serverTypingTimeout);

          this.isTyping = t.typing;

          if (this.isTyping) {
            this.cdr.detectChanges();
            setTimeout(() => {
              this.shouldScroll = true;
              this.scrollToBottom();
            }, 50);

            this.serverTypingTimeout = setTimeout(() => {
              this.zone.run(() => {
                this.isTyping = false;
                this.cdr.detectChanges();
              });
            }, 6000);
          }

          this.cdr.detectChanges();
        });
      })
    );

    // ── Présence
    this.subs.push(
      this.wsService.presenceListe$.subscribe(usersConnectes => {
        this.zone.run(() => {
          this.contacts.forEach(c => {
            c.statut = usersConnectes.includes(c.keycloakId)
              ? 'en-ligne'
              : 'hors-ligne';
          });
          this._majFiltres();
          this.cdr.detectChanges();
        });
      })
    );

  } // ✅ ferme _connecterWebSocket

  // ── Sélection contact ─────────────────────────────────
  selectContact(contact: Contact): void {
    this.contactActif = contact;
    contact.nonLus = 0;
    contact.id = 0;
    this.chargement = true;
    this.messages = [];
    this.isTyping = false;
    this.isSendingTyping = false;
    this._majNonLus();
    this._majFiltres();

    setTimeout(() => {
      this.http.post<ConversationDTO>(
        `${BACK_URL}/api/chat/conversations`, null,
        { params: { user2Id: contact.keycloakId, user2Nom: contact.nom } }
      ).subscribe({
        next: (conv) => {
          contact.id = conv.id;
          this._chargerMessages(conv.id);
        },
        error: (err) => {
          console.error('❌ Erreur conversation:', err);
          this.chargement = false;
          this.cdr.detectChanges();
        }
      });
    }, 0);
  }

  private _chargerMessages(convId: number): void {
    this.http.get<MessageDTO[]>(
      `${BACK_URL}/api/chat/conversations/${convId}/messages`
    ).subscribe({
      next: (msgs) => {
        this.tousMessages[convId] = (msgs ?? []).map(m => this._toLocalMsg(m));
        this.messages = [...this.tousMessages[convId]];
        this.chargement = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur messages:', err);
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Envoi message ─────────────────────────────────────
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.contactActif?.id) return;

    const contenu = this.newMessage.trim();

    if (this.stopTypingTimeout) clearTimeout(this.stopTypingTimeout);
    if (this.typingThrottle) clearTimeout(this.typingThrottle);
    if (this.isSendingTyping) {
      this.wsService.envoyerTyping(
        this.contactActif.id, this.contactActif.keycloakId, false
      );
      this.isSendingTyping = false;
    }

    this._ajouterMessageLocal({
      id: -(Date.now()),
      auteur: this.moi.nom,
      initiales: this._initiales(this.moi.nom),
      contenu,
      heure: new Date(),
      estMoi: true,
      typeMessage: 'TEXTE'
    });

    this.wsService.envoyerMessage({
      conversationId: this.contactActif.id,
      destinataireId: this.contactActif.keycloakId,
      contenu,
      expediteurNom: this.moi.nom
    });

    this._majDernierMessage(this.moi.id, contenu, false);

    this.newMessage = '';
    this.shouldScroll = true;
    this.cdr.detectChanges();

    setTimeout(() => this.messageInput?.nativeElement?.focus(), 50);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ── Typing ────────────────────────────────────────────
  onInputChange(): void {
    if (!this.contactActif?.id) return;

    if (!this.isSendingTyping) {
      this.isSendingTyping = true;
      this.wsService.envoyerTyping(
        this.contactActif.id, this.contactActif.keycloakId, true
      );
      this.typingThrottle = setTimeout(() => {
        this.isSendingTyping = false;
      }, 1500);
    }

    if (this.stopTypingTimeout) clearTimeout(this.stopTypingTimeout);
    this.stopTypingTimeout = setTimeout(() => {
      if (this.contactActif?.id) {
        this.wsService.envoyerTyping(
          this.contactActif.id, this.contactActif.keycloakId, false
        );
        this.isSendingTyping = false;
      }
    }, 2500);
  }

  // ── Upload fichier ────────────────────────────────────
  onFichierSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.contactActif?.id) return;

    const file = input.files[0];
    const convId = this.contactActif.id;
    const destId = this.contactActif.keycloakId;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', String(convId));
    formData.append('destinataireId', destId);

    this.http.post<MessageDTO>(`${BACK_URL}/api/chat/upload`, formData)
      .subscribe({
        next: (msg) => {
          this.zone.run(() => {
            if (!this.tousMessages[msg.conversationId]) {
              this.tousMessages[msg.conversationId] = [];
            }
            const conv = this.tousMessages[msg.conversationId];

            if (!conv.some(m => m.id === msg.id)) {
              conv.push(this._toLocalMsg(msg));
              this.tousMessages[msg.conversationId] = [...conv];

              if (this.contactActif?.id === msg.conversationId) {
                this.messages = [...conv];
                this.shouldScroll = true;
              }

              this._majDernierMessage(
                this.moi.id,
                msg.fileName ?? 'Fichier',
                true
              );

              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => console.error('❌ Erreur upload:', err)
      });

    input.value = '';
  }

  // ── Ouvrir fichier ────────────────────────────────────
  ouvrirFichier(fileUrl: string): void {
    if (!fileUrl) return;
    const url = fileUrl.startsWith('http') ? fileUrl : `${BACK_URL}${fileUrl}`;
    window.open(url, '_blank');
  }

  // ── Effacer affichage ─────────────────────────────────
  effacerAffichage(): void {
    this.messages = [];
    if (this.contactActif?.id) {
      this.tousMessages[this.contactActif.id] = [];
    }
  }

  // ── Helpers ───────────────────────────────────────────
  private _majNonLus(): void {
    this.totalNonLus = this.contacts.reduce((s, c) => s + (c.nonLus || 0), 0);
  }

  private _majFiltres(): void {
    const q = this.recherche.trim().toLowerCase();
    const liste = q
      ? this.contacts.filter(c => c.nom.toLowerCase().includes(q))
      : [...this.contacts];

    liste.sort((a, b) => b.nonLus - a.nonLus);
    this.contactsFiltres = liste;
  }

  private _majDernierMessage(expediteurId: string, contenu: string, estFichier = false): void {
    if (!expediteurId) return;

    const texte = estFichier
      ? '📎 ' + (contenu.length > 20 ? contenu.substring(0, 20) + '...' : contenu)
      : (contenu.length > 30 ? contenu.substring(0, 30) + '...' : contenu);

    const keycloakId = expediteurId === this.moi.id
      ? this.contactActif?.keycloakId
      : expediteurId;

    if (!keycloakId) return;

    const idx = this.contacts.findIndex(c => c.keycloakId === keycloakId);
    if (idx === -1) return;

    const updated = this.contacts.map((c, i) =>
      i === idx ? { ...c, dernierMessage: texte } : c
    );

    const contact = updated.splice(idx, 1)[0];
    this.contacts = [contact, ...updated];

    this._majFiltres();
  }

  private _ajouterMessageLocal(msg: ChatMessage): void {
    if (!this.contactActif?.id) return;
    this.messages = [...this.messages, msg];
    this.tousMessages[this.contactActif.id] = this.messages;
    this.shouldScroll = true;
  }

  private _toLocalMsg(dto: MessageDTO): ChatMessage {
    const estMoi = dto.expediteurId === this.moi.id;
    const nom = dto.expediteurNom ?? (estMoi ? this.moi.nom : 'Correspondant');
    return {
      id: dto.id,
      auteur: nom,
      initiales: this._initiales(nom),
      contenu: dto.contenu ?? '',
      heure: dto.dateEnvoi ? new Date(dto.dateEnvoi) : new Date(),
      estMoi,
      typeMessage: dto.typeMessage,
      fileUrl: dto.fileUrl,
      fileName: dto.fileName
    };
  }

  private _initiales(nom: string): string {
    return nom.split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private scrollToBottom(): void {
    try {
      if (!this.messagesContainer) return;
      const el = this.messagesContainer.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch { }
  }
}