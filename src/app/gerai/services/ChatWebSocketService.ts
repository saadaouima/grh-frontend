import { Injectable, OnDestroy, inject } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import Keycloak from 'keycloak-js';
import { MessageDTO, TypingResponse } from 'src/app/gerai/models/chat.models';

export interface PresenceDTO {
  userId: string;
  connecte: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatWebSocketService implements OnDestroy {

  private keycloak = inject(Keycloak);
  private client!: Client;
  private subscriptions: StompSubscription[] = [];

  messageRecu$   = new Subject<MessageDTO>();
  typing$        = new Subject<TypingResponse>();
  connecte$      = new Subject<boolean>();
  presenceListe$ = new Subject<string[]>();

  // ── Connexion ─────────────────────────────────────────
  connect(): void {
    if (this.client?.active) {
      console.log('⚠️ WebSocket déjà actif');
      return;
    }

    const token = this.keycloak.token ?? '';

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8085/ws?token=${token}`),

      connectHeaders: { token },
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),

      onConnect: () => {
        console.log('✅ WebSocket connecté');
        this.connecte$.next(true);
        this._abonnerAuxMessages();
      },

      onDisconnect: () => {
        console.log('🔌 WebSocket déconnecté');
        this.connecte$.next(false);
      },

      onStompError: (frame) => {
        console.error('❌ Erreur STOMP:', frame.headers['message']);
      },

      onWebSocketClose: () => {
        console.warn('📡 WebSocket fermé');
        this.connecte$.next(false);
      }
    });

    this.client.activate();
  }

  // ── Abonnements ───────────────────────────────────────
  private _abonnerAuxMessages(): void {
    const userId = this.keycloak.tokenParsed?.['sub'] ?? '';
    console.log('📡 Abonnement pour user:', userId);

    // Messages
    const sub1 = this.client.subscribe(
      `/user/queue/messages`,
      (msg: IMessage) => {
        try {
          const data: MessageDTO = JSON.parse(msg.body);
          console.log('📨 Message reçu', data);
          this.messageRecu$.next(data);
        } catch (err) {
          console.error('Erreur parsing message', err);
        }
      }
    );

    // Typing
    const sub2 = this.client.subscribe(
      `/user/queue/typing`,
      (msg: IMessage) => {
        try {
          const data: TypingResponse = JSON.parse(msg.body);
          this.typing$.next(data);
        } catch (err) {
          console.error('Erreur parsing typing', err);
        }
      }
    );

    // Présence
    const sub3 = this.client.subscribe(
      `/topic/presence`,
      (msg: IMessage) => {
        try {
          const usersConnectes: string[] = JSON.parse(msg.body);
          console.log('👤 Users en ligne:', usersConnectes);
          this.presenceListe$.next(usersConnectes);
        } catch (err) {
          console.error('Erreur parsing presence', err);
        }
      }
    );

    this.subscriptions.push(sub1, sub2, sub3);
  }

  // ── Envoi message ─────────────────────────────────────
  envoyerMessage(payload: {
    conversationId: number;
    destinataireId: string;
    contenu: string;
    expediteurNom: string;
  }): void {
    if (!this.client?.connected) {
      console.warn('WebSocket non connecté');
      return;
    }
    this.client.publish({
      destination: '/app/chat.envoyer',
      body: JSON.stringify(payload)
    });
  }

  // ── Typing ────────────────────────────────────────────
  envoyerTyping(
    conversationId: number,
    destinataireId: string,
    typing: boolean
  ): void {
    if (!this.client?.connected) return;
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId, destinataireId, typing })
    });
  }

  // ── Déconnexion ───────────────────────────────────────
  disconnect(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    if (this.client?.active) {
      this.client.deactivate();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}