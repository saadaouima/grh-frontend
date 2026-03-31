/**
 * ChatWebSocketService
 * ─────────────────────────────────────────────────────────────
 * En développement (MSW) :
 *   Simule fidèlement le comportement STOMP/Kafka :
 *   - Présence initiale + mise à jour dynamique
 *   - Messages entrants aléatoires avec typing pré-curseur
 *   - Confirmation ENVOYE → DELIVRE après envoi
 *
 * En production (Spring Boot + Kafka + STOMP) :
 *   Remplacer le corps de connect() par :
 *
 *   const client = new Client({
 *     webSocketFactory: () => new SockJS('/ws'),
 *     onConnect: () => {
 *       client.subscribe(`/topic/chat/${convId}`, msg => {
 *         this.zone.run(() => this.messageRecu$.next(JSON.parse(msg.body)));
 *       });
 *       client.subscribe(`/topic/typing/${convId}`, msg => {
 *         this.zone.run(() => this.typing$.next(JSON.parse(msg.body)));
 *       });
 *       client.subscribe('/topic/presence', msg => {
 *         this.zone.run(() => this.presenceListe$.next(JSON.parse(msg.body)));
 *       });
 *     }
 *   });
 *   client.activate();
 *
 *   envoyerMessage() → client.publish({ destination: '/app/chat/send', body })
 *   envoyerTyping()  → client.publish({ destination: '/app/chat/typing', body })
 */

import { Injectable, OnDestroy, NgZone, inject } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { MessageDTO, TypingResponse } from 'src/app/gerai/models/chat.models';
import {
  CHAT_USERS_MOCK, MOI_ID,
  MESSAGES_SIMULATION, MOCK_CONVERSATIONS,
  nextMsgId, nomComplet
} from 'src/app/mocks/data/chat.mocks';

@Injectable({ providedIn: 'root' })
export class ChatWebSocketService implements OnDestroy {

  private zone = inject(NgZone);

  // ── Flux publics ───────────────────────────────────────────
  readonly messageRecu$ = new Subject<MessageDTO>();
  readonly typing$ = new Subject<TypingResponse>();
  readonly connecte$ = new Subject<boolean>();
  readonly presenceListe$ = new Subject<string[]>();

  // ── Timers ─────────────────────────────────────────────────
  private _msgSub?: Subscription;
  private _presenceSub?: Subscription;
  private _typingTimer: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;

  /* ════════════════════════════════════════════════════════════
     🔌 CONNEXION
     ════════════════════════════════════════════════════════════ */

  connect(): void {
    if (this._connected) return;
    this._connected = true;

    this.zone.run(() => this.connecte$.next(true));
    console.info('[ChatWS] ✅ Connecté (simulation)');

    // Présence initiale : tous en ligne
    this._emettrePresence(CHAT_USERS_MOCK.map(u => u.id));

    // Présence dynamique toutes les 20 s
    this._presenceSub = interval(20_000).subscribe(() => {
      const enLigne = [...CHAT_USERS_MOCK]
        .filter(() => Math.random() > 0.2)
        .map(u => u.id);
      if (!enLigne.length) enLigne.push(CHAT_USERS_MOCK[0].id);
      this._emettrePresence(enLigne);
    });

    // Messages entrants simulés toutes les 22 s
    this._msgSub = interval(22_000).subscribe(() => {
      if (Math.random() < 0.4) {
        this.zone.run(() => this._simulerMessageEntrant());
      }
    });
  }

  /* ════════════════════════════════════════════════════════════
     📤 ENVOI MESSAGE
     ════════════════════════════════════════════════════════════ */

  /**
   * Production → stompClient.publish('/app/chat/send', payload)
   * Simulation → émet une confirmation DELIVRE après 250 ms
   *              (simule l'ACK Kafka : message persisté + notifié)
   */
  envoyerMessage(payload: {
    conversationId: number;
    destinataireId: string;
    contenu: string;
    expediteurNom: string;
  }): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.messageRecu$.next({
          id: nextMsgId(),
          conversationId: payload.conversationId,
          expediteurId: MOI_ID,
          expediteurNom: payload.expediteurNom,
          contenu: payload.contenu,
          dateEnvoi: new Date().toISOString(),
          typeMessage: 'TEXTE',
          statut: 'DELIVRE'
        });
      });
    }, 250);
  }

  /* ════════════════════════════════════════════════════════════
     ⌨️ TYPING
     ════════════════════════════════════════════════════════════ */

  /**
   * Production → stompClient.publish('/app/chat/typing', { conversationId, typing })
   * Simulation → silencieux (le typing sortant est géré dans ChatComponent)
   */
  envoyerTyping(
    conversationId: number,
    _destinataireId: string,
    typing: boolean
  ): void {
    if (typing) console.debug(`[ChatWS] ⌨️ typing ON → conv:${conversationId}`);
  }

  /* ════════════════════════════════════════════════════════════
     🔌 DÉCONNEXION
     ════════════════════════════════════════════════════════════ */

  disconnect(): void {
    if (!this._connected) return;
    this._msgSub?.unsubscribe();
    this._presenceSub?.unsubscribe();
    if (this._typingTimer) clearTimeout(this._typingTimer);
    this.zone.run(() => this.connecte$.next(false));
    this._connected = false;
    console.info('[ChatWS] ❌ Déconnecté');
  }

  ngOnDestroy(): void { this.disconnect(); }

  /* ════════════════════════════════════════════════════════════
     🎲 SIMULATION
     ════════════════════════════════════════════════════════════ */

  private _emettrePresence(ids: string[]): void {
    this.zone.run(() => this.presenceListe$.next(ids));
  }

  /**
   * Simule le flux Kafka :
   *   /topic/typing/{convId}  → TypingResponse (ON)
   *   attente 2-3 s
   *   /topic/typing/{convId}  → TypingResponse (OFF)
   *   /topic/chat/{convId}    → MessageDTO
   */
  private _simulerMessageEntrant(): void {
    const user = _pick(CHAT_USERS_MOCK);
    const contenu = _pick(MESSAGES_SIMULATION);

    const convsPossibles = MOCK_CONVERSATIONS.filter(
      c => c.participant1Id === user.id || c.participant2Id === user.id
    );
    if (!convsPossibles.length) return;

    const conv = _pick(convsPossibles);
    const convId = conv.id;

    // Typing ON
    this.typing$.next({ expediteurId: user.id, conversationId: convId, typing: true });

    // Typing OFF + message
    this._typingTimer = setTimeout(() => {
      this.zone.run(() => {
        this.typing$.next({ expediteurId: user.id, conversationId: convId, typing: false });

        this.messageRecu$.next({
          id: nextMsgId(),
          conversationId: convId,
          expediteurId: user.id,
          expediteurNom: nomComplet(user),
          contenu,
          dateEnvoi: new Date().toISOString(),
          typeMessage: 'TEXTE',
          statut: 'DELIVRE'
        });

        console.debug(`[ChatWS] 💬 ${nomComplet(user)}: "${contenu}"`);
      });
    }, 2000 + Math.random() * 1200);
  }
}

function _pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}