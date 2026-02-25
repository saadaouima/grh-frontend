import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  
  // 🔐 Configuration Keycloak (Production)
  keycloak: {
    url: 'https://keycloak.votre-domaine.com', // À adapter
    realm: 'gerai',
    clientId: 'gerai'
  },
  
  // 🌐 Configuration API Backend Spring Boot (Production)
  apiUrl: 'https://api.votre-domaine.com/api', // À adapter
  
  // 📡 Configuration WebSocket (Production)
  websocketUrl: 'wss://api.votre-domaine.com/ws', // À adapter
  
  // 🔧 Configuration générale
  app: {
    name: 'GerAI',
    description: 'Gestion des Ressources Humaines Intelligente',
    version: packageInfo.version,
    author: 'Votre équipe'
  },
  
  // ⚙️ Features flags
  features: {
    chat: true,
    notifications: true,
    chatbot: true,
    reports: true,
    analytics: true
  },
  
  // 📊 Configuration pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },
  
  // 🕐 Configuration timeouts
  timeout: {
    api: 30000,
    upload: 120000
  }
};