const mongoose = require('mongoose');
const commandConfigSchema = new mongoose.Schema({ name: { type: String, unique: true }, enabled: { type: Boolean, default: true }, adminOnly: { type: Boolean, default: false }, description: String }, { timestamps: true });
module.exports = mongoose.model('CommandConfig', commandConfigSchema);
