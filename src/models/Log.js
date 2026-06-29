const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({ level: String, message: String, phone: String, meta: Object }, { timestamps: true });
module.exports = mongoose.model('Log', logSchema);
