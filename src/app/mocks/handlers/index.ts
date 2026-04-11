import { demandesHandlers } from './demandes.handlers';
import { chatHandlers } from './chat.handlers';
import { equipeHandlers } from './equipe-chef.handlers';
import { TachesHandlers } from './taches-chef.handlers';
import { ProjetsHandlers } from './projets-chef.handlers';
import { RapportsHandlers } from './rapports-chef.handlers';
import { notificationsHandlers } from './notifications.handlers';
import { profilEmployeHandlers } from './employe-profile.handlers';
import { tachesHandlers } from './taches-employe.handlers';
import { projetsEmployeHandlers } from './projets-employe.handlers';
import { congesHandlers } from './conges.handlers';
import { employeHandlers } from './employe.handlers';

export const allHandlers = [
    // Modules métier
    ...equipeHandlers,
    ...chatHandlers,
    ...demandesHandlers,
    ...TachesHandlers,
    ...ProjetsHandlers,
    ...RapportsHandlers,
    ...notificationsHandlers,
    ...profilEmployeHandlers,
    ...tachesHandlers,
    ...projetsEmployeHandlers,
    ...congesHandlers,
    ...employeHandlers
];