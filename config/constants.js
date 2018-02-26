// Load dotenv
require('dotenv').config()

const serverPort = process.env.PORT || 4000
const baseUrl = process.env.baseUrl || 'http://localhost'

export default {
  version: '0.0.1',
  serverPort,
  baseUrl,
  mongoDatabaseUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017',
  staticUrl: process.env.STATIC_URL || `${baseUrl}:${serverPort}`,
  tokens: {
    facebookKey: process.env.FACEBOOK_KEY || '',
    apolloEngine: process.env.APOLLO_ENGINE_KEY || '',
    googleCloudMessaging: process.env.GOOGLE_CLOUD_MESSAGING || '',
  },
};
