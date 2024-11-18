const db = require("../config/database");

const Approver = {
  findByTarget: async (targetType, targetId) => {
    const query = `
      SELECT a.approver_id, a.is_backup, u.name AS approver_name
      FROM approvers a
      INNER JOIN users u ON a.approver_id = u.id
      WHERE a.target_type = $1 AND a.target_id = $2
    `;
    const values = [targetType, targetId];
    const result = await db.query(query, values);
    return result.rows;
  }
};

module.exports = Approver;
