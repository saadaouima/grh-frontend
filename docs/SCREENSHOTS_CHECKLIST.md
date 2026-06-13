# Checklist des captures d'écran et figures à fournir

Pour chaque élément ci-dessous :
1. Prendre la capture / créer le diagramme
2. Enregistrer dans `docs/images/` avec le nom exact indiqué
3. Décommenter la ligne `\includegraphics` correspondante dans le fichier .tex

---

## Chapitre 1 — Cadre général

| Fichier image | Description | Fichier .tex |
|---|---|---|
| `arabsoft_logo.png` | Logo officiel Arabsoft | chapitre1.tex |
| `organigramme_arabsoft.png` | Organigramme de la société | chapitre1.tex |

**À remplir aussi dans chapitre1.tex :**
- `[ANNÉE_CRÉATION]` — année de création d'Arabsoft
- `[EFFECTIF]` — nombre de collaborateurs
- `[SECTEURS_ACTIVITÉ]` — secteurs (ex. banque, assurance, industrie...)
- `[FORME JURIDIQUE]` — ex. SARL, SA...
- `[ADRESSE, VILLE, TUNISIE]`
- `[URL]` — site web

---

## Chapitre 2 — Analyse et conception

| Fichier image | Description | Fichier .tex |
|---|---|---|
| `uml_usecase_global.png` | Diagramme cas d'utilisation global (tous acteurs) | chapitre2.tex |
| `uml_usecase_employes.png` | Cas d'utilisation — gestion des employés | chapitre2.tex |
| `uml_usecase_projets.png` | Cas d'utilisation — projets et tâches | chapitre2.tex |
| `uml_deployment.png` | Diagramme de déploiement Docker Compose | chapitre2.tex |
| `uml_class_diagram.png` | Diagramme de classes principal | chapitre2.tex |
| `schema_er_oracle.png` | Schéma ER Oracle (EMPLOYEES, LEAVE_REQUESTS, PROJECTS, TASKS) | chapitre2.tex |
| `roadmap_projet.png` | Feuille de route / Gantt (4 mois, 7 sprints) | chapitre2.tex |

**Outil recommandé :** draw.io (gratuit) → exporter en PNG 300dpi

---

## Chapitre 3 — Sprints 1 & 2

| Fichier image | Description | Fichier .tex |
|---|---|---|
| `uml_uc_authentifier.png` | Cas d'utilisation raffiné — S'authentifier | chapitre3.tex |
| `keycloak_admin_realm.png` | Console Keycloak — realm Synapse et rôles | chapitre3.tex |
| `screenshot_login.png` | Page de connexion Synapse | chapitre3.tex |
| `flyway_history.png` | Table flyway_schema_history (SQL Developer / DBeaver) | chapitre3.tex |
| `uml_uc_employes.png` | Cas d'utilisation raffiné — Gérer les employés | chapitre3.tex |
| `code_jwt_converter.png` | Capture IntelliJ — SecurityConfig.java (JwtAuthenticationConverter) | chapitre3.tex |
| `code_keycloak_main.png` | Capture VS Code — main.ts Angular | chapitre3.tex |
| `apis_employe_service.png` | Postman — APIs de l'employe-service | chapitre3.tex |
| `code_employe_service.png` | Capture VS Code — employe.service.ts | chapitre3.tex |
| `screenshot_employee_list.png` | Interface Angular — liste des employés | chapitre3.tex |
| `screenshot_create_employee.png` | Interface Angular — formulaire de création | chapitre3.tex |
| `screenshot_employee_profile.png` | Interface Angular — fiche de profil | chapitre3.tex |
| `screenshot_admin_dashboard.png` | Interface Angular — tableau de bord admin | chapitre3.tex |

---

## Chapitre 4 — Sprints 3, 4 & 5

| Fichier image | Description | Fichier .tex |
|---|---|---|
| `uml_uc_demande.png` | Cas d'utilisation raffiné — Déposer une demande | chapitre4.tex |
| `code_demande_service.png` | Capture IntelliJ — DemandeService.java (validerChef) | chapitre4.tex |
| `apis_demandes_service.png` | Postman — APIs du demandes-service | chapitre4.tex |
| `code_deposer_demande.png` | Capture VS Code — deposer-demande.component.ts | chapitre4.tex |
| `screenshot_demande_conge_form.png` | Interface Angular — formulaire congé (employé) | chapitre4.tex |
| `screenshot_demandes_chef.png` | Interface Angular — liste des demandes (chef) | chapitre4.tex |
| `screenshot_mes_demandes.png` | Interface Angular — mes demandes (employé) | chapitre4.tex |
| `kafka_topology.png` | Schéma topologie Kafka (draw.io) | chapitre4.tex |
| `screenshot_notifications.png` | Interface Angular — centre de notifications | chapitre4.tex |
| `uml_uc_pret.png` | Cas d'utilisation raffiné — Demande de prêt | chapitre4.tex |
| `uml_uc_chat.png` | Cas d'utilisation raffiné — Messagerie interne | chapitre4.tex |
| `code_ai_chat_service.png` | Capture IntelliJ — AiChatService.java (appel Groq) | chapitre4.tex |
| `screenshot_chat_list.png` | Interface Angular — liste des conversations | chapitre4.tex |
| `screenshot_chat_conversation.png` | Interface Angular — fenêtre de conversation | chapitre4.tex |
| `screenshot_ai_chatbot.png` | Interface Angular — widget chatbot flottant | chapitre4.tex |

---

## Chapitre 5 — Sprints 6 & 7

| Fichier image | Description | Fichier .tex |
|---|---|---|
| `uml_class_projets.png` | Diagramme de classes — Projet, Tâche, ProjectMember | chapitre5.tex |
| `uml_uc_projet.png` | Cas d'utilisation raffiné — Gérer un projet | chapitre5.tex |
| `code_cv_scoring.png` | Capture IntelliJ — CvScoringService.java | chapitre5.tex |
| `screenshot_projets_list.png` | Interface Angular — liste des projets (chef) | chapitre5.tex |
| `screenshot_taches.png` | Interface Angular — gestion des tâches | chapitre5.tex |
| `screenshot_evaluations.png` | Interface Angular — campagnes d'évaluation et fiche chef | chapitre5.tex |
| `screenshot_candidates_scoring.png` | Interface Angular — scores CV (recrutement) | chapitre5.tex |
| `screenshot_job_posting.png` | Interface Angular — liste des offres d'emploi publiées | chapitre5.tex |
| `screenshot_candidate_list.png` | Interface Angular — candidats avec scores IA et shortlist | chapitre5.tex |
| `screenshot_interviews.png` | Interface Angular — planification entretiens et décisions | chapitre5.tex |
| `uml_uc_rapport.png` | Cas d'utilisation raffiné — Générer un rapport | chapitre5.tex |
| `code_attrition_query.png` | Capture IntelliJ — requête SQL AttritionRepository | chapitre5.tex |
| `code_report_service.png` | Capture IntelliJ — ReportService.java (JasperReports) | chapitre5.tex |
| `screenshot_analytics_dashboard.png` | Interface Angular — tableau de bord analytique admin | chapitre5.tex |
| `screenshot_rapports_form.png` | Interface Angular — formulaire de génération rapports | chapitre5.tex |
| `screenshot_rapport_pdf.png` | Aperçu du PDF généré par JasperReports | chapitre5.tex |
| `screenshot_attrition_main.png` | Interface Angular — vue principale attrition | chapitre5.tex |
| `screenshot_attrition_detail.png` | Interface Angular — modal détail employé (gauge + facteurs) | chapitre5.tex |

---

## Conseils pour les captures d'écran

- **Résolution :** minimum 1280×720, idéalement 1920×1080
- **Format :** PNG (pas JPG pour les interfaces — meilleure netteté du texte)
- **Code source :** utiliser IntelliJ avec thème clair pour une meilleure lisibilité à l'impression
- **Anonymisation :** remplacer les données personnelles réelles par des données fictives cohérentes (ex. "Ahmed B.", "Département IT")
- **Captures Postman :** afficher le nom de la requête, la méthode HTTP, l'URL et le statut de la réponse

---

## Diagrammes UML (draw.io recommandé)

Pour chaque diagramme UML manquant, utiliser draw.io (`drawio.com`) :
1. Créer le diagramme
2. Exporter en PNG (File → Export as → PNG, 300 dpi)
3. Placer dans `docs/images/`

**Diagrammes prioritaires :**
1. `uml_usecase_global.png` — montre tous les acteurs et leurs cas d'utilisation principaux
2. `uml_deployment.png` — montre les conteneurs Docker et leurs interactions
3. `uml_class_diagram.png` — entités principales (Employee, Demande, Projet, Tache)
4. `roadmap_projet.png` — Gantt sur 4 mois avec les 7 sprints et jalons
