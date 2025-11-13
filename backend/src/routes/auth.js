import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { verificarValidaciones } from "../middlewares/validaciones.js";
import { pool } from "../config/db.js";
import { getPasswordColumn } from "../utils/passwordColumn.js";

const router = express.Router();

router.post(
  "/register",
  body("nombre").isString().trim().isLength({ min: 1, max: 100 }),
  body("email").isEmail().isLength({ max: 100 }).normalizeEmail(),
  body("password").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }),
  verificarValidaciones,
  async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 12);
      const passCol = await getPasswordColumn();
      const sql = `INSERT INTO usuario (nombre, email, ${passCol}) VALUES (?,?,?)`;
      const [result] = await pool.execute(sql, [nombre, email, hashed]);
      res
        .status(201)
        .json({ success: true, user: { id: result.insertId, nombre, email } });
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ success: false, message: "Email ya registrado" });
      }
      console.error("Error en registro:", err);
      res.status(500).json({ success: false, message: "Error al registrar usuario" });
    }
  }
);

router.post(
  "/login",
  body("email").isEmail().isLength({ max: 100 }).normalizeEmail(),
  body("password").isString().isLength({ min: 8 }),
  verificarValidaciones,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const passCol = await getPasswordColumn();
      const sql = `SELECT id_usuario, email, ${passCol} AS password_hash, nombre FROM usuario WHERE email=?`;
      const [rows] = await pool.execute(sql, [email]);
      if (rows.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Credenciales inválidas" });
      }
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res
          .status(400)
          .json({ success: false, message: "Credenciales inválidas" });
      }
      const payload = { userId: user.id_usuario };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });
      res.json({
        success: true,
        token,
        user: { id: user.id_usuario, nombre: user.nombre, email: user.email },
      });
    } catch (err) {
      console.error("Error en login:", err);
      res.status(500).json({ success: false, message: "Error en login" });
    }
  }
);

export default router;
