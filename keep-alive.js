const https = require('https');

const KEEP_ALIVE_URL = 'https://backend-compra-pronta.onrender.com/health';
const INTERVAL_MINUTES = 10;

function pingServer() {
  const req = https.get(KEEP_ALIVE_URL, (res) => {
    console.log(`[${new Date().toISOString()}] Keep-alive ping: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Keep-alive error:`, err.message);
  });

  req.setTimeout(10000, () => {
    console.log(`[${new Date().toISOString()}] Keep-alive timeout`);
    req.destroy();
  });
}

// Ping every 10 minutes
setInterval(pingServer, INTERVAL_MINUTES * 60 * 1000);

// Initial ping
pingServer();

console.log(`🚀 Keep-alive script started. Pinging every ${INTERVAL_MINUTES} minutes.`);
console.log(`📡 Target: ${KEEP_ALIVE_URL}`);
console.log(`⏰ Next ping in ${INTERVAL_MINUTES} minutes...`);
