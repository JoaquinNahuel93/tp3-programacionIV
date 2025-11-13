import express from "express";
import { pool } from "../config/db.js";
import { validarId, verificarValidaciones } from "../middlewares/validaciones.js";
import { verificarAutenticacion } from "../middlewares/auth.js";
import { body } from "express-validator";

const router = express.Router();

router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_materia, nombre, codigo, anio FROM materia ORDER BY nombre"
    );
    res.json({ success: true, materias: rows });
  } catch (err) {
    console.error("Error al obtener materias:", err);
    res.status(500).json({ success: false, message: "Error al obtener materias" });
  }
});

router.get(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await pool.execute(
        "SELECT id_materia, nombre, codigo, anio FROM materia WHERE id_materia=?",
        [id]
      );
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Materia no encontrada" });
      }
      res.json({ success: true, materia: rows[0] });
    } catch (err) {
      console.error("Error al obtener materia:", err);
      res.status(500).json({ success: false, message: "Error al obtener materia" });
    }
  }
);

router.post(
  "/",
  verificarAutenticacion,
  body("nombre").isString().trim().isLength({ min: 1, max: 100 }),
  body("codigo").isString().trim().isLength({ min: 1, max: 20 }),
  body("anio").isInt({ min: 1 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { nombre, codigo, anio } = req.body;
      const [result] = await pool.execute(
        "INSERT INTO materia (nombre, codigo, anio) VALUES (?,?,?)",
        [nombre, codigo, anio]
      );
      res
        .status(201)
        .json({ success: true, materia: { id: result.insertId, nombre, codigo, anio } });
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ success: false, message: "Código ya registrado" });
      }
      console.error("Error al crear materia:", err);
      res.status(500).json({ success: false, message: "Error al crear materia" });
    }
  }
);

router.put(
  "/:id",
  verificarAutenticacion,
  validarId,
  body("nombre").isString().trim().isLength({ min: 1, max: 100 }),
  body("codigo").isString().trim().isLength({ min: 1, max: 20 }),
  body("anio").isInt({ min: 1 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nombre, codigo, anio } = req.body;
      const [result] = await pool.execute(
        "UPDATE materia SET nombre=?, codigo=?, anio=? WHERE id_materia=?",
        [nombre, codigo, anio, id]
      );
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Materia no encontrada" });
      }
      res.json({ success: true, materia: { id, nombre, codigo, anio } });
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ success: false, message: "Código ya registrado" });
      }
      console.error("Error al actualizar materia:", err);
      res.status(500).json({ success: false, message: "Error al actualizar materia" });
    }
  }
);

router.delete(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [result] = await pool.execute("DELETE FROM materia WHERE id_materia=?", [id]);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Materia no encontrada" });
      }
      res.json({ success: true, data: id });
    } catch (err) {
      console.error("Error al eliminar materia:", err);
      res.status(500).json({ success: false, message: "Error al eliminar materia" });
    }
  }
);

export default router;
