const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const BotSession = require('../models/BotSession');
const { handleCommand } = require('./commandService');
const { write, logger } = require('./logger');

const sockets = new Map();
const baseDir = path.resolve(process.cwd(), 'sessions');
fs.mkdirSync(baseDir, { recursive: true });

function jidPhone(jid = '') { return jid.split('@')[0].split(':')[0]; }
function sessionDir(phone) { return path.join(baseDir, phone.replace(/\D/g, '')); }

async function startSession(phone, io) {
  const cleanPhone = phone.replace(/\D/g, '');
  const sessionPath = sessionDir(cleanPhone);
  fs.mkdirSync(sessionPath, { recursive: true });
  const record = await BotSession.findOneAndUpdate({ phone: cleanPhone }, { phone: cleanPhone, status: 'pairing', sessionPath }, { upsert: true, new: true });
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state, printQRInTerminal: false, logger });
  sockets.set(cleanPhone, sock);

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      record.qrCodeDataUrl = await qrcode.toDataURL(qr);
      record.status = 'qr';
      await record.save();
      io.emit('session:update', record);
    }
    if (connection === 'open') {
      record.status = 'connected'; record.lastConnectedAt = new Date(); record.pairingCode = undefined; await record.save();
      await write('info', 'WhatsApp session connected', { phone: cleanPhone });
      io.emit('session:update', record);
    }
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      record.status = code === DisconnectReason.loggedOut ? 'disconnected' : 'error';
      record.lastError = lastDisconnect?.error?.message;
      await record.save();
      sockets.delete(cleanPhone);
      io.emit('session:update', record);
      if (code !== DisconnectReason.loggedOut) setTimeout(() => startSession(cleanPhone, io), 5000);
    }
  });

  if (!state.creds.registered && sock.requestPairingCode) {
    const pairingCode = await sock.requestPairingCode(cleanPhone);
    record.pairingCode = pairingCode; record.status = 'pairing'; await record.save();
  }

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || '';
    const remoteJid = msg.key.remoteJid;
    if (record.settings.antilink && /https?:\/\//i.test(text) && remoteJid.endsWith('@g.us')) await sock.sendMessage(remoteJid, { text: 'Links are not allowed in this group.' });
    await handleCommand({ sock, session: record, message: msg, text, sender: remoteJid, isGroup: remoteJid.endsWith('@g.us'), participant: jidPhone(msg.key.participant) });
    await record.save();
  });

  return record;
}

async function disconnectSession(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  const sock = sockets.get(cleanPhone);
  if (sock) await sock.logout();
  sockets.delete(cleanPhone);
  await BotSession.findOneAndUpdate({ phone: cleanPhone }, { status: 'disconnected' });
}

async function broadcast(text) {
  const results = [];
  for (const [phone, sock] of sockets.entries()) {
    await sock.sendMessage(`${phone}@s.whatsapp.net`, { text });
    results.push(phone);
  }
  return results;
}

module.exports = { startSession, disconnectSession, broadcast, sockets };
