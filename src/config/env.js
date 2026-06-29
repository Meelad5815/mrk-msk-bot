require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mrk_msk_bot',
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  encryptionKey: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  adminUsername: process.env.ADMIN_USERNAME || 'superadmin',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  ownerName: process.env.OWNER_NAME || 'Bot Owner',
  ownerPhone: process.env.OWNER_PHONE || '15551234567',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  newsApiKey: process.env.NEWS_API_KEY || ''
};
