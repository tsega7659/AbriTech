require('dotenv').config();
const app = require('./app');
const { logChapaSetupHints } = require('./config/chapa.config');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  logChapaSetupHints();
});
