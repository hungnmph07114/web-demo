/**
 * Status & Healthcheck Controller
 */
const { pool } = require('../config/db');

async function getStatus(req, res, next) {
  const startTime = Date.now();
  let dbStatus = 'Disconnected';
  let dbTime = null;
  let latency = 0;

  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db_name');
    dbStatus = 'Connected';
    dbTime = result.rows[0].now;
    latency = Date.now() - startTime;
  } catch (error) {
    dbStatus = `Error: ${error.message}`;
  }

  res.json({
    server: 'Online',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      latencyMs: latency,
      serverTime: dbTime
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime())
    }
  });
}

module.exports = {
  getStatus
};
