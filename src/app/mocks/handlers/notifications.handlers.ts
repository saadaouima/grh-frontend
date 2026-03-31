import { delay, http, HttpResponse } from 'msw';
import {
    MOCK_CHEF_NOTIFICATIONS,
    MOCK_EMPLOYE_NOTIFICATIONS
} from 'src/app/mocks/data/notifications.mock';

type Role = 'CHEF' | 'EMPLOYE';

// Utilisation de références locales pour permettre la mutation propre par MSW
let chefNotifs = [...MOCK_CHEF_NOTIFICATIONS];
let employeNotifs = [...MOCK_EMPLOYE_NOTIFICATIONS];

function resolveSource(role: string) {
    // Normalisation de la casse pour éviter les erreurs de matching
    const r = role.toUpperCase();
    return r === 'CHEF' ? chefNotifs : employeNotifs;
}

export const notificationsHandlers = [

    /**
     * GET /api/notifications
     */
    http.get('/api/notifications', async ({ request }) => {
        await delay(20);
        const url = new URL(request.url);
        const roleParam = url.searchParams.get('role') || 'EMPLOYE';

        const source = resolveSource(roleParam);

        // On trie par date décroissante (plus récent en premier)
        const sorted = [...source].sort(
            (a, b) => new Date(b.heure).getTime() - new Date(a.heure).getTime()
        );

        return HttpResponse.json(sorted);
    }),

    /**
     * PATCH /api/notifications/:id/read
     */
    http.patch('/api/notifications/:id/read', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);

        // On cherche dans les deux listes
        const notif = [...chefNotifs, ...employeNotifs].find(n => n.id === id);

        if (!notif) {
            return new HttpResponse(null, { status: 404 });
        }

        notif.lue = true; // Mutation de l'objet en mémoire
        return HttpResponse.json(notif);
    }),

    /**
     * POST /api/notifications/mark-all-read
     */
    http.post('/api/notifications/mark-all-read', async ({ request }) => {
        await delay(20);
        const url = new URL(request.url);
        const roleParam = url.searchParams.get('role') || 'EMPLOYE';

        const source = resolveSource(roleParam);

        // On modifie directement les objets de la source
        source.forEach(n => {
            n.lue = true;
        });

        return new HttpResponse(null, { status: 204 });
    }),

    /**
     * DELETE /api/notifications/:id
     */
    http.delete('/api/notifications/:id', async ({ params }) => {
        await delay(20);
        const id = Number(params['id']);

        const ci = chefNotifs.findIndex(n => n.id === id);
        if (ci !== -1) {
            chefNotifs.splice(ci, 1);
            return new HttpResponse(null, { status: 204 });
        }

        const ei = employeNotifs.findIndex(n => n.id === id);
        if (ei !== -1) {
            employeNotifs.splice(ei, 1);
            return new HttpResponse(null, { status: 204 });
        }

        return new HttpResponse(null, { status: 404 });
    }),

    /**
     * DELETE /api/notifications (Vider tout)
     */
    http.delete('/api/notifications', async ({ request }) => {
        await delay(20);
        const url = new URL(request.url);
        const roleParam = url.searchParams.get('role') || 'EMPLOYE';

        if (roleParam.toUpperCase() === 'CHEF') {
            chefNotifs = [];
        } else {
            employeNotifs = [];
        }

        return new HttpResponse(null, { status: 204 });
    })
];