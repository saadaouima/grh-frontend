import { http, HttpResponse } from 'msw';
import {
    getToutesDemandes,
    getDemandesByEmploye,
    getDemandeById,
    getDemandesEnAttente,
    getHistorique,
    getStatistiques,
    creerDemande,
    annulerDemande,
    validerDemandeChef,
    validerDemandeRH
} from '../data/demandes.mock';
import { CreateDemandeDTO } from 'src/app/gerai/models/demande.model';

/* ══════════════════════════════════════════════════════════════
   🌐 HANDLERS MSW - DEMANDES (Partagées Chef & Employé)
   ══════════════════════════════════════════════════════════════ */

const BASE_URL = '/api/demandes';

export const demandesHandlers = [

    /* ══════════════════════════════════════════════════════════════
       📋 ENDPOINTS EMPLOYÉ
       ══════════════════════════════════════════════════════════════ */

    /**
     * GET /api/demandes/employe/:employeId
     * Récupère toutes les demandes d'un employé
     */
    http.get(`${BASE_URL}/employe/:employeId`, ({ params }) => {
        const employeId = params['employeId'] as string;
        const demandes = getDemandesByEmploye(employeId);
        console.log('[MSW] 📋 GET /api/demandes/employe/' + employeId + ' -', demandes.length, 'demandes');
        return HttpResponse.json(demandes);
    }),

    /**
     * GET /api/demandes/employe/:employeId/complet
     * Récupère demandes + statistiques en une seule requête (OPTIMISÉ)
     */
    http.get(`${BASE_URL}/employe/:employeId/complet`, ({ params }) => {
        const employeId = params['employeId'] as string;
        const data = {
            demandes: getDemandesByEmploye(employeId),
            statistiques: getStatistiques(employeId)
        };
        console.log('[MSW] 🎯 GET /api/demandes/employe/' + employeId + '/complet (optimisé)');
        return HttpResponse.json(data);
    }),

    /**
     * GET /api/demandes/employe/:employeId/statistiques
     * Récupère les statistiques d'un employé
     */
    http.get(`${BASE_URL}/employe/:employeId/statistiques`, ({ params }) => {
        const employeId = params['employeId'] as string;
        const stats = getStatistiques(employeId);
        console.log('[MSW] 📊 GET /api/demandes/employe/' + employeId + '/statistiques');
        return HttpResponse.json(stats);
    }),

    /**
     * POST /api/demandes
     * Crée une nouvelle demande
     */
    http.post(BASE_URL, async ({ request }) => {
        const body = await request.json() as CreateDemandeDTO & { employeId: string };

        if (!body.type || !body.description) {
            return new HttpResponse(
                JSON.stringify({ error: 'Données incomplètes' }),
                { status: 400 }
            );
        }

        const nouvelleDemande = creerDemande({
            employeId: body.employeId || 'emp-001',
            type: body.type,
            description: body.description,
            dateDebut: body.dateDebut,
            dateFin: body.dateFin
        });

        console.log('[MSW] ✅ POST /api/demandes -', body.type, body.description);
        return HttpResponse.json(nouvelleDemande, { status: 201 });
    }),

    /**
     * DELETE /api/demandes/:id
     * Annule une demande (employé peut annuler seulement si EN_ATTENTE)
     */
    http.delete(`${BASE_URL}/:id`, ({ params }) => {
        const id = Number(params['id']);
        const success = annulerDemande(id);

        if (!success) {
            return new HttpResponse(
                JSON.stringify({ error: 'Impossible d\'annuler cette demande' }),
                { status: 400 }
            );
        }

        console.log('[MSW] 🗑️ DELETE /api/demandes/' + id);
        return new HttpResponse(null, { status: 204 });
    }),

    /**
     * GET /api/demandes/:id
     * Récupère le détail d'une demande
     */
    http.get(`${BASE_URL}/:id`, ({ params }) => {
        const id = Number(params['id']);
        const demande = getDemandeById(id);

        if (!demande) {
            return new HttpResponse(
                JSON.stringify({ error: 'Demande introuvable' }),
                { status: 404 }
            );
        }

        console.log('[MSW] 👁️ GET /api/demandes/' + id);
        return HttpResponse.json(demande);
    }),

    /* ══════════════════════════════════════════════════════════════
   👔 ENDPOINTS CHEF (Version réaliste REST)
   ══════════════════════════════════════════════════════════════ */

    /**
     * GET /api/demandes/chef/:chefId/a-valider
     * Récupère les demandes en attente pour un chef
     */
    http.get(`${BASE_URL}/chef/:chefId/a-valider`, ({ params, request }) => {
        const chefId = params['chefId'] as string;
        const url = new URL(request.url);
        const employeId = url.searchParams.get('employeId') || undefined;

        const demandes = getDemandesEnAttente(employeId);

        console.log(`[MSW] 📋 GET /api/demandes/chef/${chefId}/a-valider -`,
            demandes.length,
            'demandes'
        );

        return HttpResponse.json(demandes);
    }),


    /**
     * GET /api/demandes/chef/:chefId/historique
     * Récupère l'historique traité par un chef
     */
    http.get(`${BASE_URL}/chef/:chefId/historique`, ({ params, request }) => {
        const chefId = params['chefId'] as string;
        const url = new URL(request.url);
        const employeId = url.searchParams.get('employeId') || undefined;

        const demandes = getHistorique(employeId);

        console.log(`[MSW] 📚 GET /api/demandes/chef/${chefId}/historique -`,
            demandes.length,
            'demandes'
        );

        return HttpResponse.json(demandes);
    }),


    /**
     * PUT /api/demandes/chef/:chefId/:id/valider
     * Valide ou rejette une demande (Chef)
     */
    http.put(`${BASE_URL}/chef/:chefId/:id/valider`, async ({ params, request }) => {
        const chefId = params['chefId'] as string;
        const id = Number(params['id']);

        const url = new URL(request.url);
        const approuve = url.searchParams.get('approuve') === 'true';
        const commentaire = url.searchParams.get('commentaire') || '';

        const demandeValidee = validerDemandeChef(id, approuve, commentaire);

        if (!demandeValidee) {
            return new HttpResponse(
                JSON.stringify({ error: 'Demande introuvable' }),
                { status: 404 }
            );
        }

        console.log(
            `[MSW] ✅ PUT /api/demandes/chef/${chefId}/${id}/valider -`,
            approuve ? 'APPROUVEE' : 'REJETEE'
        );

        return HttpResponse.json(demandeValidee);
    })
];