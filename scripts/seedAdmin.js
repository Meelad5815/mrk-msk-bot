const connectDatabase = require('../src/config/database');
const User = require('../src/models/User');
const env = require('../src/config/env');

(async () => {
  await connectDatabase();
  const passwordHash = await User.hashPassword(env.adminPassword);
  await User.findOneAndUpdate({ username: env.adminUsername }, { username: env.adminUsername, passwordHash, role: 'super_admin' }, { upsert: true });
  console.log(`Super admin ready: ${env.adminUsername}`);
  process.exit(0);
})().catch((error) => { console.error(error); process.exit(1); });
