const mongoose = require('mongoose');
const { createApp } = require('../src/server');
const connectDatabase = require('../src/config/database');

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      if (process.env.MONGODB_URI && mongoose.connection.readyState === 0) await connectDatabase();
      return createApp({ emit: () => {} });
    })();
  }
  return appPromise;
}

module.exports = async (req, res) => {
  const app = await getApp();
  return app(req, res);
};
