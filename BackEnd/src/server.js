// quiet: true suppresses the "injecting env" and "tips" messages in recent dotenv versions
require('dotenv').config({ quiet: true });
const app = require('./app');
const { logChapaSetupHints } = require('./config/chapa.config');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  logChapaSetupHints();
});
