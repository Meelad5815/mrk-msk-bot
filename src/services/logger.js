const pino = require('pino');
const Log = require('../models/Log');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

async function write(level, message, meta = {}) {
  logger[level] ? logger[level](meta, message) : logger.info(meta, message);
  try { await Log.create({ level, message, phone: meta.phone, meta }); } catch (_) {}
}

module.exports = { logger, write };
