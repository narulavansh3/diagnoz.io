// Previous imports remain the same...

// Add WebSocket initialization
import { initializeWebSocket } from './websocket.js';
import http from 'http';

const app = express();
const server = http.createServer(app);
const { notifyEligibleRadiologists } = initializeWebSocket(server);

// Previous middleware and database initialization remain...

// Update case status endpoint
app.post('/api/cases/:id/accept', authenticateToken, async (req, res) => {
  const { id: caseId } = req.params;
  const { id: radiologistId, role } = req.user;

  if (role !== 'RADIOLOGIST') {
    return res.status(403).json({ error: 'Only radiologists can accept cases' });
  }

  try {
    // Start transaction
    await db.run('BEGIN TRANSACTION');

    // Check if case is still available
    const case_ = await db.get(
      'SELECT * FROM cases WHERE id = ? AND status = ?',
      [caseId, 'PENDING']
    );

    if (!case_) {
      await db.run('ROLLBACK');
      return res.status(404).json({ error: 'Case not available' });
    }

    // Update case status and assign radiologist
    await db.run(
      'UPDATE cases SET status = ?, assignee_id = ? WHERE id = ?',
      ['ASSIGNED', radiologistId, caseId]
    );

    // Get updated case with details
    const updatedCase = await db.get(`
      SELECT 
        c.*,
        u1.email as creator_email,
        u2.email as assignee_email,
        dc.name as center_name,
        r.name as radiologist_name
      FROM cases c
      LEFT JOIN users u1 ON c.creator_id = u1.id
      LEFT JOIN users u2 ON c.assignee_id = u2.id
      LEFT JOIN centers dc ON u1.id = dc.user_id
      LEFT JOIN radiologists r ON u2.id = r.user_id
      WHERE c.id = ?
    `, [caseId]);

    await db.run('COMMIT');

    // Notify the diagnostic center about case acceptance
    const centerWs = radiologistConnections.get(case_.creator_id);
    if (centerWs && centerWs.readyState === WebSocket.OPEN) {
      centerWs.send(JSON.stringify({
        type: 'CASE_ACCEPTED',
        data: updatedCase
      }));
    }

    res.json(updatedCase);
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('Error accepting case:', error);
    res.status(500).json({ error: 'Failed to accept case' });
  }
});

// Submit report endpoint
app.post('/api/cases/:id/report', authenticateToken, async (req, res) => {
  const { id: caseId } = req.params;
  const { findings, impression } = req.body;
  const { id: radiologistId, role } = req.user;

  if (role !== 'RADIOLOGIST') {
    return res.status(403).json({ error: 'Only radiologists can submit reports' });
  }

  try {
    await db.run('BEGIN TRANSACTION');

    // Verify case assignment
    const case_ = await db.get(
      'SELECT * FROM cases WHERE id = ? AND assignee_id = ?',
      [caseId, radiologistId]
    );

    if (!case_) {
      await db.run('ROLLBACK');
      return res.status(404).json({ error: 'Case not found or not assigned to you' });
    }

    // Create report
    const reportId = Math.random().toString(36).substr(2, 9);
    await db.run(
      'INSERT INTO reports (id, findings, impression, case_id) VALUES (?, ?, ?, ?)',
      [reportId, findings, impression, caseId]
    );

    // Update case status
    await db.run(
      'UPDATE cases SET status = ? WHERE id = ?',
      ['COMPLETED', caseId]
    );

    // Get complete case details with report
    const completedCase = await db.get(`
      SELECT 
        c.*,
        r.findings,
        r.impression,
        u1.email as creator_email,
        u2.email as assignee_email,
        dc.name as center_name,
        rad.name as radiologist_name
      FROM cases c
      LEFT JOIN reports r ON c.id = r.case_id
      LEFT JOIN users u1 ON c.creator_id = u1.id
      LEFT JOIN users u2 ON c.assignee_id = u2.id
      LEFT JOIN centers dc ON u1.id = dc.user_id
      LEFT JOIN radiologists rad ON u2.id = rad.user_id
      WHERE c.id = ?
    `, [caseId]);

    await db.run('COMMIT');

    // Notify the diagnostic center about report completion
    const centerWs = radiologistConnections.get(case_.creator_id);
    if (centerWs && centerWs.readyState === WebSocket.OPEN) {
      centerWs.send(JSON.stringify({
        type: 'REPORT_COMPLETED',
        data: completedCase
      }));
    }

    res.json(completedCase);
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get cases with detailed information
app.get('/api/cases', authenticateToken, async (req, res) => {
  const { role, id } = req.user;
  
  try {
    let query = `
      SELECT 
        c.*,
        u1.email as creator_email,
        u2.email as assignee_email,
        dc.name as center_name,
        r.name as radiologist_name,
        rep.findings,
        rep.impression
      FROM cases c
      LEFT JOIN users u1 ON c.creator_id = u1.id
      LEFT JOIN users u2 ON c.assignee_id = u2.id
      LEFT JOIN centers dc ON u1.id = dc.user_id
      LEFT JOIN radiologists r ON u2.id = r.user_id
      LEFT JOIN reports rep ON c.id = rep.case_id
    `;

    const params = [];
    if (role === 'CENTER') {
      query += ' WHERE c.creator_id = ?';
      params.push(id);
    } else {
      query += ' WHERE (c.status = ? OR c.assignee_id = ?)';
      params.push('PENDING', id);
    }

    query += ' ORDER BY c.created_at DESC';

    const cases = await db.all(query, params);
    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Previous routes remain the same...

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

server.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

const wsServer = http.createServer();
wsServer.listen(WS_PORT, () => {
  console.log(`WebSocket Server running on port ${WS_PORT}`);
});