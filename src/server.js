const express = require('express');
const http = require('http');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const csrf = require('csurf');
const { Server } = require('socket.io');
const env = require('./config/env');
const connectDatabase = require('./config/database');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const { logger } = require('./services/logger');

async function bootstrap() {
  await connectDatabase();
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.appUrl, credentials: true } });
  app.set('io', io);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(session({ secret: env.sessionSecret, resave: false, saveUninitialized: false, store: MongoStore.create({ mongoUrl: env.mongoUri }), cookie: { httpOnly: true, sameSite: 'strict', secure: env.nodeEnv === 'production' } }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(csrf({ cookie: { httpOnly: true, sameSite: 'strict', secure: env.nodeEnv === 'production' } }));
  app.get('/api/csrf-token', (req, res) => res.json({ csrfToken: req.csrfToken() }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/api/auth', authRoutes);
  app.use('/api', apiRoutes);
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
  io.on('connection', (socket) => socket.emit('hello', { ok: true }));
  server.listen(env.port, () => logger.info(`MRK MSK WhatsApp bot dashboard running on ${env.port}`));
}

bootstrap().catch((error) => { logger.error(error, 'Failed to boot application'); process.exit(1); });
