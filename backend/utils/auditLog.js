const pool = require('../db/pool');

const log = async (actorUserId, actorRole, actionType, entityType, entityId, details = null) => {
  try {
    await pool.query(
      `INSERT INTO AuditLog
       (ActorUserID, ActorRole, ActionType, TargetEntityType, TargetEntityID, AdditionalDetails)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [actorUserId, actorRole, actionType, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('AuditLog write failed:', err.message);
  }
};

module.exports = { log };
