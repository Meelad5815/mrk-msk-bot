const express = require('express');
const Joi = require('joi');
const BotSession = require('../models/BotSession');
const User = require('../models/User');
const Log = require('../models/Log');
const CommandConfig = require('../models/CommandConfig');
const { startSession, disconnectSession, broadcast } = require('../services/whatsappService');
const { requireAuth, requireAdmin } = require('./middleware');
const router = express.Router();

router.post('/sessions', async (req, res) => {
  const { value, error } = Joi.object({ phone: Joi.string().pattern(/^\+?[0-9]{8,15}$/).required() }).validate(req.body);
  if (error) return res.status(400).json({ error: 'Enter a valid international phone number.' });
  const session = await startSession(value.phone, req.app.get('io'));
  res.json(session);
});
router.get('/sessions/:phone', async (req, res) => res.json(await BotSession.findOne({ phone: req.params.phone.replace(/\D/g, '') })));
router.get('/admin/sessions', requireAuth, requireAdmin, async (req, res) => res.json(await BotSession.find().sort('-updatedAt')));
router.delete('/admin/sessions/:phone', requireAuth, requireAdmin, async (req, res) => { await disconnectSession(req.params.phone); res.json({ ok: true }); });
router.post('/admin/restart/:phone', requireAuth, requireAdmin, async (req, res) => res.json(await startSession(req.params.phone, req.app.get('io'))));
router.post('/admin/broadcast', requireAuth, requireAdmin, async (req, res) => res.json({ sentTo: await broadcast(req.body.message || '') }));
router.get('/admin/logs', requireAuth, requireAdmin, async (req, res) => res.json(await Log.find().sort('-createdAt').limit(200)));
router.get('/admin/stats', requireAuth, requireAdmin, async (req, res) => res.json({ sessions: await BotSession.countDocuments(), connected: await BotSession.countDocuments({ status: 'connected' }), users: await User.countDocuments(), commands: await CommandConfig.countDocuments() }));
router.get('/admin/users', requireAuth, requireAdmin, async (req, res) => res.json(await User.find().select('-passwordHash')));
router.patch('/admin/users/:id/ban', requireAuth, requireAdmin, async (req, res) => res.json(await User.findByIdAndUpdate(req.params.id, { banned: Boolean(req.body.banned) }, { new: true }).select('-passwordHash')));
router.get('/admin/commands', requireAuth, requireAdmin, async (req, res) => res.json(await CommandConfig.find().sort('name')));
router.put('/admin/commands/:name', requireAuth, requireAdmin, async (req, res) => res.json(await CommandConfig.findOneAndUpdate({ name: req.params.name }, req.body, { upsert: true, new: true })));
module.exports = router;
