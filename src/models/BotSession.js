const mongoose = require('mongoose');

const botSessionSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'pairing', 'qr', 'connected', 'disconnected', 'banned', 'error'], default: 'pending' },
  pairingCode: String,
  qrCodeDataUrl: String,
  sessionPath: String,
  encryptedState: String,
  stats: { messages: { type: Number, default: 0 }, commands: { type: Number, default: 0 }, groups: { type: Number, default: 0 } },
  settings: { welcome: { type: Boolean, default: true }, antilink: { type: Boolean, default: false }, antispam: { type: Boolean, default: true }, autoReact: { type: Boolean, default: false } },
  lastConnectedAt: Date,
  lastError: String
}, { timestamps: true });

module.exports = mongoose.model('BotSession', botSessionSchema);
