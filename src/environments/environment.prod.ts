import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,

  // 🔐 Configuration Keycloak
  keycloak: {
    url: 'https://keycloak.gerai.tn',
    realm: 'gerai',
    clientId: 'gerai'
  },

  // 🌐 Configuration API Backend Spring Boot
  apiUrl: 'https://api.gerai.tn/api',

  // 📡 Configuration WebSocket chat-service
  websocketUrl: 'wss://api.gerai.tn/ws',

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