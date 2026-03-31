/**
 * chat.mock.ts
 * ─────────────────────────────────────────────────────────────
 * Source unique de vérité pour toute la simulation du chat.
 *
 * Architecture de production (Spring Boot + Kafka + STOMP) :
 * ┌──────────────────────────────────────────────────────────┐
 * │  Kafka Topics :                                          │
 * │    chat.message.{conversationId}  → messages temps réel  │
 * │    chat.typing.{conversationId}   → indicateur de frappe  │
 * │    chat.presence                  → liste des connectés   │
 * │                                                          │
 * │  STOMP Destinations (front) :                            │
 * │    /topic/chat/{convId}           → messages reçus        │
 * │    /topic/typing/{convId}         → typing indicator       │
 * │    /topic/presence                → présence globale       │
 * │    /app/chat/send                 → envoi message          │
 * │    /app/chat/typing               → signaler frappe        │
 * └──────────────────────────────────────────────────────────┘
 */

import { delay, http, HttpResponse } from 'msw';
import { ConversationDTO, MessageDTO } from 'src/app/gerai/models/chat.models';

// ══════════════════════════════════════════════════════════════
// IDENTITÉ SIMULÉE (remplace keycloak.sub en dev)
// ══════════════════════════════════════════════════════════════

export const MOI_ID = 'user-1';
export const MOI_NOM = 'Moi';

// ══════════════════════════════════════════════════════════════
// UTILISATEURS KEYCLOAK
// ══════════════════════════════════════════════════════════════

export const CHAT_USERS_MOCK = [
    {
        id: '98d63792-7104-4b53-b0a5-f39b6999a0d8',
        username: 'nabil',
        firstName: 'Nabil',
        lastName: 'Benzarti',
        email: 'nabil@gerai.tn'
    },
    {
        id: 'd8004f21-7290-48e0-ae89-082098650085',
        username: 'ahmed',
        firstName: 'Ahmed',
        lastName: 'Khalil',
        email: 'ahmed@gerai.tn'
    },
    {
        id: '749f7e52-bc66-4d0a-9d6e-0960bc21008d',
        username: 'sarra',
        firstName: 'Sarra',
        lastName: 'Trabelsi',
        email: 'sarra@gerai.tn'
    }
] as const;

export type MockUser = typeof CHAT_USERS_MOCK[number];

export function nomComplet(u: MockUser): string {
    return [u.firstName, u.lastName].filter(Boolean).join(' ');
}

// ══════════════════════════════════════════════════════════════
// AUTO-INCRÉMENT
// ══════════════════════════════════════════════════════════════

let _convId = 10;
let _msgId = 100;

export const nextConvId = () => _convId++;
export const nextMsgId = () => _msgId++;

// ══════════════════════════════════════════════════════════════
// CONVERSATIONS
// ══════════════════════════════════════════════════════════════

export let MOCK_CONVERSATIONS: ConversationDTO[] = [
    {
        id: 1,
        participant1Id: MOI_ID,
        participant2Id: CHAT_USERS_MOCK[0].id,
        participant1Nom: MOI_NOM,
        participant2Nom: nomComplet(CHAT_USERS_MOCK[0]),
        dernierMessage: 'Salut, as-tu validé le rapport ?',
        dateDernierMessage: _ago(60)
    },
    {
        id: 2,
        participant1Id: MOI_ID,
        participant2Id: CHAT_USERS_MOCK[1].id,
        participant1Nom: MOI_NOM,
        participant2Nom: nomComplet(CHAT_USERS_MOCK[1]),
        dernierMessage: 'On se voit demain ?',
        dateDernierMessage: _ago(180)
    }
];

// ══════════════════════════════════════════════════════════════
// MESSAGES
// ══════════════════════════════════════════════════════════════

export let MOCK_MESSAGES: MessageDTO[] = [
    _m(1, 1, CHAT_USERS_MOCK[0].id, nomComplet(CHAT_USERS_MOCK[0]), 'Bonjour ! Tu vas bien ? 👋', 'LU', 7),
    _m(2, 1, MOI_ID, MOI_NOM, 'Bien merci ! Et toi ?', 'LU', 6),
    _m(3, 1, CHAT_USERS_MOCK[0].id, nomComplet(CHAT_USERS_MOCK[0]), 'Top ! Tu as lu le rapport ?', 'LU', 5),
    _m(4, 1, MOI_ID, MOI_NOM, 'Pas encore, je le fais ce soir.', 'DELIVRE', 4),
    _m(5, 1, CHAT_USERS_MOCK[0].id, nomComplet(CHAT_USERS_MOCK[0]), 'Salut, as-tu validé le rapport ?', 'LU', 1),
    _m(6, 2, CHAT_USERS_MOCK[1].id, nomComplet(CHAT_USERS_MOCK[1]), 'Hey ! Dispo demain matin ?', 'LU', 5),
    _m(7, 2, MOI_ID, MOI_NOM, 'Oui, à partir de 9h.', 'DELIVRE', 4),
    _m(8, 2, CHAT_USERS_MOCK[1].id, nomComplet(CHAT_USERS_MOCK[1]), 'On se voit demain ?', 'LU', 2)
];

// ══════════════════════════════════════════════════════════════
// POOLS SIMULATION WEBSOCKET
// ══════════════════════════════════════════════════════════════

export const MESSAGES_SIMULATION: string[] = [
    'Tu as vu le dernier email du DRH ? 📧',
    'Je termine la revue de code, ça prend 10 min.',
    'La réunion est déplacée à 14h.',
    'Peux-tu jeter un œil au ticket #48 ?',
    'Merci pour ton aide ! 🙏',
    'OK, je m\'en occupe dès que possible.',
    'On confirme pour la démo vendredi ?',
    'Excellent travail sur le sprint ! 🚀',
    'Petit souci sur l\'API, tu as 5 min ?',
    'À plus tard ! 👋'
];

// ══════════════════════════════════════════════════════════════
// MSW HANDLERS
// ══════════════════════════════════════════════════════════════

export const chatHandlers = [

    http.get('*/api/keycloak/users', async () => {
        await delay(20);
        return HttpResponse.json(CHAT_USERS_MOCK);
    }),

    http.get('*/api/chat/conversations', async () => {
        await delay(20);
        const siennes = MOCK_CONVERSATIONS.filter(
            c => c.participant1Id === MOI_ID || c.participant2Id === MOI_ID
        );
        return HttpResponse.json(siennes);
    }),

    http.post('*/api/chat/conversations', async ({ request }) => {
        await delay(20);
        let body: { user2Id?: string; user2Nom?: string } = {};
        try { body = await request.json() as typeof body; } catch { /**/ }
        const { user2Id, user2Nom } = body;
        if (!user2Id) return new HttpResponse(null, { status: 400 });

        let conv = MOCK_CONVERSATIONS.find(c =>
            (c.participant1Id === MOI_ID && c.participant2Id === user2Id) ||
            (c.participant1Id === user2Id && c.participant2Id === MOI_ID)
        );
        if (!conv) {
            conv = {
                id: nextConvId(),
                participant1Id: MOI_ID,
                participant2Id: user2Id,
                participant1Nom: MOI_NOM,
                participant2Nom: user2Nom ?? 'Inconnu',
                dernierMessage: '',
                dateDernierMessage: new Date().toISOString()
            };
            MOCK_CONVERSATIONS.push(conv);
        }
        return HttpResponse.json(conv);
    }),

    http.get('*/api/chat/conversations/:id/messages', async ({ params }) => {
        await delay(20);
        const convId = Number(params['id']);
        return HttpResponse.json(MOCK_MESSAGES.filter(m => m.conversationId === convId));
    }),

    http.post('*/api/chat/send', async ({ request }) => {
        await delay(20);
        const body = await request.json() as {
            conversationId: number; contenu: string;
            expediteurId: string; expediteurNom: string;
        };
        const msg: MessageDTO = {
            id: nextMsgId(),
            conversationId: body.conversationId,
            expediteurId: body.expediteurId ?? MOI_ID,
            expediteurNom: body.expediteurNom ?? MOI_NOM,
            contenu: body.contenu ?? '',
            dateEnvoi: new Date().toISOString(),
            typeMessage: 'TEXTE',
            statut: 'ENVOYE'
        };
        MOCK_MESSAGES.push(msg);
        _majConv(msg);
        return HttpResponse.json(msg);
    }),

    http.post('*/api/chat/upload', async ({ request }) => {
        await delay(20);
        const fd = await request.formData();
        const file = fd.get('file') as File | null;
        const convId = Number(fd.get('conversationId'));
        if (!file) return new HttpResponse(null, { status: 400 });

        const isImage = file.type.startsWith('image/');
        const msg: MessageDTO = {
            id: nextMsgId(),
            conversationId: convId,
            expediteurId: MOI_ID,
            expediteurNom: MOI_NOM,
            contenu: '',
            dateEnvoi: new Date().toISOString(),
            typeMessage: isImage ? 'IMAGE' : 'FICHIER',
            statut: 'ENVOYE',
            fileName: file.name,
            fileUrl: isImage
                ? `https://placehold.co/400x300/4680FF/fff?text=${encodeURIComponent(file.name)}`
                : `/files/mock/${encodeURIComponent(file.name)}`
        };
        MOCK_MESSAGES.push(msg);
        _majConv(msg);
        return HttpResponse.json(msg);
    }),

    http.post('*/api/chat/read/:id', async ({ params }) => {
        await delay(20);
        const convId = Number(params['id']);
        MOCK_MESSAGES = MOCK_MESSAGES.map(m =>
            m.conversationId === convId && m.expediteurId !== MOI_ID
                ? { ...m, statut: 'LU' }
                : m
        );
        return HttpResponse.json({ success: true });
    }),

    http.delete('*/api/chat/conversations/:id/messages', async ({ params }) => {
        await delay(20);
        const convId = Number(params['id']);
        MOCK_MESSAGES = MOCK_MESSAGES.filter(m => m.conversationId !== convId);
        const conv = MOCK_CONVERSATIONS.find(c => c.id === convId);
        if (conv) conv.dernierMessage = '';
        return HttpResponse.json({ success: true });
    })
];

// ══════════════════════════════════════════════════════════════
// UTILITAIRES PRIVÉS
// ══════════════════════════════════════════════════════════════

function _m(
    id: number, convId: number,
    expId: string, expNom: string,
    contenu: string,
    statut: MessageDTO['statut'],
    hoursAgo: number
): MessageDTO {
    return {
        id, conversationId: convId,
        expediteurId: expId, expediteurNom: expNom,
        contenu, dateEnvoi: _ago(hoursAgo * 60),
        typeMessage: 'TEXTE', statut
    };
}

function _ago(min: number): string {
    return new Date(Date.now() - min * 60_000).toISOString();
}

function _majConv(msg: MessageDTO): void {
    const conv = MOCK_CONVERSATIONS.find(c => c.id === msg.conversationId);
    if (!conv) return;
    conv.dernierMessage = msg.contenu || msg.fileName || 'Fichier';
    conv.dateDernierMessage = msg.dateEnvoi;
}