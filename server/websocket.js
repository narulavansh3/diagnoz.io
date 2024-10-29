import WebSocket from 'ws';
import db from './db.js';

export const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  // Store radiologist WebSocket connections
  const radiologistConnections = new Map();

  wss.on('connection', (ws, req) => {
    // Extract radiologist ID from request
    const radiologistId = req.headers['x-radiologist-id'];
    
    if (radiologistId) {
      radiologistConnections.set(radiologistId, ws);
      
      ws.on('close', () => {
        radiologistConnections.delete(radiologistId);
        // Update last active timestamp
        db.run(
          'UPDATE radiologists SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
          [radiologistId]
        );
      });
    }
  });

  return {
    notifyEligibleRadiologists: async (caseData) => {
      // Find eligible radiologists based on specialization and availability
      const eligibleRadiologists = await db.query(
        `SELECT r.id, r.specialties 
         FROM radiologists r 
         WHERE r.is_available = 1 
         AND json_extract(r.specialties, '$') LIKE ?`,
        [`%${caseData.modality}%`]
      );

      // Send notification to all eligible and connected radiologists
      eligibleRadiologists.forEach((radiologist) => {
        const ws = radiologistConnections.get(radiologist.id);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(caseData));
        }
      });
    }
  };
};