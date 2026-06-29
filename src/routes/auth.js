const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const env = require('../config/env');
const router = express.Router();
const schema = Joi.object({ username: Joi.string().required(), password: Joi.string().required() });

router.post('/login', async (req, res) => {
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const user = await User.findOne({ username: value.username, banned: false });
  if (!user || !(await user.comparePassword(value.password))) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, role: user.role, username: user.username }, env.jwtSecret, { expiresIn: '12h' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: env.nodeEnv === 'production' }).json({ token, user: { username: user.username, role: user.role } });
});
router.post('/logout', (req, res) => res.clearCookie('token').json({ ok: true }));
module.exports = router;
