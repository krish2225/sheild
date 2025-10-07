import { Server } from 'socket.io';

export const initializeSockets = (httpServer, logger) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_ORIGIN,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
      ].filter(Boolean),
      credentials: true,
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // namespace for real-time sensors
  const sensorsNamespace = io.of('/sensors');
  sensorsNamespace.on('connection', (socket) => {
    logger.info(`Sensors namespace connected: ${socket.id}`);
  });

  // namespace for alerts
  const alertsNamespace = io.of('/alerts');
  alertsNamespace.on('connection', (socket) => {
    logger.info(`Alerts namespace connected: ${socket.id}`);
  });

  // Mock emitter for demo: broadcasts random sensor data every 2s
  const machineIds = ['M-1001', 'M-1002', 'M-1003'];
  setInterval(() => {
    const payload = machineIds.map((id, idx) => {
      // Generate values that will ensure multiple machines trigger alerts
      // Machine 1: Moderate risk (high severity)
      // Machine 2: High risk (critical severity) 
      // Machine 3: Low risk (no alert)
      const vibration = 20 + idx * 8 + Math.random() * 5; // 20-35 range
      const temperature = 70 + idx * 5 + Math.random() * 4; // 70-85 range
      const current = 8 + idx * 2 + Math.random();
      const healthScore = Math.max(0, 100 - vibration * 1.8 - Math.max(0, temperature - 60));
      return {
        machineId: id,
        timestamp: new Date().toISOString(),
        vibration: Number(vibration.toFixed(2)),
        temperature: Number(temperature.toFixed(2)),
        current: Number(current.toFixed(2)),
        healthScore: Number(healthScore.toFixed(0)),
      };
    });
    sensorsNamespace.emit('sensor_update', payload);

    const highRisk = payload.filter((p) => p.healthScore < 40);
    console.log('Health scores:', payload.map(p => ({ machineId: p.machineId, healthScore: p.healthScore })));
    console.log('High risk machines:', highRisk.length);
    if (highRisk.length) {
      highRisk.forEach((p, idx) => {
        // Create different alert messages for variety
        const alertMessages = [
          `Low health score: ${p.healthScore}`,
          `High vibration detected: ${p.vibration} mm/s`,
          `Temperature critical: ${p.temperature}°C`,
          `Machine performance degraded`,
          `Maintenance required soon`
        ];
        
        const alert = {
          machineId: p.machineId,
          severity: p.healthScore < 25 ? 'critical' : 'high',
          message: alertMessages[idx % alertMessages.length],
          timestamp: new Date().toISOString(),
          status: 'open',
        };
        console.log('Emitting alert:', alert);
        alertsNamespace.emit('alert', alert);
      });
    }
  }, 2000);

  return io;
};


