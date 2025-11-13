import { pool } from "../config/db.js";

let cachedCol;

export async function getPasswordColumn() {
  if (cachedCol) return cachedCol;
  const [rows] = await pool.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='usuario' AND COLUMN_NAME IN ('password_hash','contraseña','contrasena') ORDER BY FIELD(COLUMN_NAME,'password_hash','contraseña','contrasena') LIMIT 1"
  );
  cachedCol = rows[0]?.COLUMN_NAME || "password_hash";
  return cachedCol;
}

