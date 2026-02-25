import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,
  
  // 🔐 Configuration Keycloak
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'gerai',
    clientId: 'gerai'
  },
  
  // 🌐 Configuration API Backend Spring Boot
  apiUrl: 'http://localhost:8080/api',
  
  // 📡 Configuration WebSocket (pour chat et notifications en temps réel)
  websocketUrl: 'ws://localhost:8080/ws',
  
  // 🔧 Configuration générale
  app: {
    name: 'GerAI',
    description: 'Gestion des Ressources Humaines Intelligente',
    version: packageInfo.version,
    author: 'Votre équipe'
  },
  
  // ⚙️ Features flags (activer/désactiver des fonctionnalités)
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
    api: 30000, // 30 secondes
    upload: 120000 // 2 minutes pour les uploads de fichiers
  }
};
