import { http, HttpResponse } from 'msw';
import { ConversationDTO, MessageDTO } from 'src/app/gerai/models/chat.models';

/* ══════════════════════════════════════════════════════════════
   📊 DATA MOCK - Utilisateurs Keycloak + état partagé
   ══════════════════════════════════════════════════════════════ */

export const CHAT_USERS_MOCK = [
    {
        id: '98d63792-7104-4b53-b0a5-f39b6999a0d8',
        username: 'nabil',
        firstName: 'Nabil',
        lastName: 'Benzarti'
    },
    {
        id: 'd8004f21-7290-48e0-ae89-082098650085',
        username: 'ahmed',
        firstName: 'Ahmed',
        lastName: ''
    },
    {
        id: '749f7e52-bc66-4d0a-9d6e-0960bc21008d',
        username: 'sarra',
        firstName: 'Sarra',
        lastName: ''
    },
    {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        username: 'sarah.t',
        firstName: 'Sarah',
        lastName: 'Trabelsi'
    }
];

/* ══════════════════════════════════════════════════════════════
   💬 Conversations & Messages (Mock state)
   ══════════════════════════════════════════════════════════════ */

let conversations: ConversationDTO[] = [];
let messages: MessageDTO[] = [];

let nextConversationId = 1;
let nextMessageId = 1;

const CURRENT_USER_ID = 'user-1';
const CURRENT_USER_NAME = 'Moi';

/* ══════════════════════════════════════════════════════════════
   🔧 UTILITAIRE
   ══════════════════════════════════════════════════════════════ */

function trouverOuCreerConversation(
    user1Id: string,
    user2Id: string,
    user1Nom: string,
    user2Nom: string
): ConversationDTO {

    let conv = conversations.find(c =>
        (c.participant1Id === user1Id && c.participant2Id === user2Id) ||
        (c.participant1Id === user2Id && c.participant2Id === user1Id)
    );

    if (!conv) {
        conv = {
            id: nextConversationId++,
            participant1Id: user1Id,
            participant2Id: user2Id,
            participant1Nom: user1Nom,
            participant2Nom: user2Nom,
            dernierMessage: '',
            dateDernierMessage: new Date().toISOString()
        };

        conversations.push(conv);
    }

    return conv;
}

/* ══════════════════════════════════════════════════════════════
   🌐 HANDLERS HTTP
   apiUrl = http://localhost:8085/api
   ══════════════════════════════════════════════════════════════ */

export const chatHandlers = [

    /* 🔑 USERS KEYCLOAK MOCK */
    http.get('http://localhost:8085/api/keycloak/users', () => {
        return HttpResponse.json(CHAT_USERS_MOCK);
    }),

    /* 📋 GET CONVERSATIONS */
    http.get('http://localhost:8085/api/chat/conversations', () => {
        return HttpResponse.json(conversations);
    }),

    /* ➕ CREATE / GET CONVERSATION */
    http.post('http://localhost:8085/api/chat/conversations', async ({ request }) => {

        let body: any = {};

        try {
            body = await request.json();
        } catch {
            return HttpResponse.json(
                { message: 'Body JSON invalide ou manquant' },
                { status: 400 }
            );
        }

        const user2Id = body.user2Id;
        const user2Nom = body.user2Nom;

        if (!user2Id) {
            return HttpResponse.json(
                { message: 'user2Id manquant' },
                { status: 400 }
            );
        }

        const conversation = trouverOuCreerConversation(
            CURRENT_USER_ID,
            user2Id,
            CURRENT_USER_NAME,
            user2Nom || 'Inconnu'
        );

        return HttpResponse.json(conversation);
    }),

    /* 📩 GET MESSAGES */
    http.get(
        'http://localhost:8085/api/chat/conversations/:id/messages',
        ({ params }) => {

            const conversationId = Number(params['id']);

            const convMessages = messages.filter(
                m => m.conversationId === conversationId
            );

            return HttpResponse.json(convMessages);
        }
    ),

    /* ✉️ SEND MESSAGE */
    http.post('http://localhost:8085/api/chat/send', async ({ request }) => {

        const body = await request.json() as any;

        if (!body.conversationId) {
            return HttpResponse.json(
                { message: 'conversationId manquant' },
                { status: 400 }
            );
        }

        const nouveauMessage: MessageDTO = {
            id: nextMessageId++,
            conversationId: body.conversationId,
            expediteurId: CURRENT_USER_ID,
            expediteurNom: CURRENT_USER_NAME,
            contenu: body.contenu,
            dateEnvoi: new Date().toISOString(),
            typeMessage: 'TEXTE',
            statut: 'ENVOYE'
        };

        messages.push(nouveauMessage);

        const conv = conversations.find(c => c.id === body.conversationId);
        if (conv) {
            conv.dernierMessage = body.contenu;
            conv.dateDernierMessage = nouveauMessage.dateEnvoi;
        }

        return HttpResponse.json(nouveauMessage);
    }),

    /* 📎 UPLOAD FILE */
    http.post('http://localhost:8085/api/chat/upload', async ({ request }) => {

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const conversationId = Number(formData.get('conversationId'));

        if (!file) {
            return HttpResponse.json(
                { message: 'Fichier manquant' },
                { status: 400 }
            );
        }

        const nouveauMessage: MessageDTO = {
            id: nextMessageId++,
            conversationId,
            expediteurId: CURRENT_USER_ID,
            expediteurNom: CURRENT_USER_NAME,
            contenu: '',
            dateEnvoi: new Date().toISOString(),
            typeMessage: file.type?.startsWith('image/')
                ? 'IMAGE'
                : 'FICHIER',
            statut: 'ENVOYE',
            fileUrl: URL.createObjectURL(file),
            fileName: file.name
        };

        messages.push(nouveauMessage);

        return HttpResponse.json(nouveauMessage);
    }),

    /* ✅ MARK AS READ */
    http.post(
        'http://localhost:8085/api/chat/read/:id',
        ({ params }) => {

            const id = Number(params['id']);

            messages = messages.map(m =>
                m.conversationId === id
                    ? { ...m, statut: 'LU' }
                    : m
            );

            return HttpResponse.json({ success: true });
        }
    )
];