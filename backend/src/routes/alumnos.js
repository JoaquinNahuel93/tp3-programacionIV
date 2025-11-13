import express from "express";
import { pool } from "../config/db.js";
import { validarId, verificarValidaciones } from "../middlewares/validaciones.js";
import { verificarAutenticacion } from "../middlewares/auth.js";
import { body } from "express-validator";

const router = express.Router();

router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_alumno, nombre, apellido, dni FROM alumno ORDER BY apellido, nombre"
    );
    res.json({ success: true, alumnos: rows });
  } catch (err) {
    console.error("Error al obtener alumnos:", err);
    res.status(500).json({ success: false, message: "Error al obtener alumnos" });
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
        "SELECT id_alumno, nombre, apellido, dni FROM alumno WHERE id_alumno=?",
        [id]
      );
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Alumno no encontrado" });
      }
      res.json({ success: true, alumno: rows[0] });
    } catch (err) {
      console.error("Error al obtener alumno:", err);
      res.status(500).json({ success: false, message: "Error al obtener alumno" });
    }
  }
);

router.post(
  "/",
  verificarAutenticacion,
  body("nombre").isString().trim().isLength({ min: 1, max: 100 }),
  body("apellido").isString().trim().isLength({ min: 1, max: 100 }),
  body("dni").isString().trim().isLength({ min: 1, max: 20 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { nombre, apellido, dni } = req.body;
      const [result] = await pool.execute(
        "INSERT INTO alumno (nombre, apellido, dni) VALUES (?,?,?)",
        [nombre, apellido, dni]
      );
      res
        .status(201)
        .json({ success: true, alumno: { id: result.insertId, nombre, apellido, dni } });
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ success: false, message: "DNI ya registrado" });
      }
      console.error("Error al crear alumno:", err);
      res.status(500).json({ success: false, message: "Error al crear alumno" });
    }
  }
);

router.put(
  "/:id",
  verificarAutenticacion,
  validarId,
  body("nombre").isString().trim().isLength({ min: 1, max: 100 }),
  body("apellido").isString().trim().isLength({ min: 1, max: 100 }),
  body("dni").isString().trim().isLength({ min: 1, max: 20 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nombre, apellido, dni } = req.body;
      const [result] = await pool.execute(
        "UPDATE alumno SET nombre=?, apellido=?, dni=? WHERE id_alumno=?",
        [nombre, apellido, dni, id]
      );
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Alumno no encontrado" });
      }
      res.json({ success: true, alumno: { id: id, nombre, apellido, dni } });
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ success: false, message: "DNI ya registrado" });
      }
      console.error("Error al actualizar alumno:", err);
      res.status(500).json({ success: false, message: "Error al actualizar alumno" });
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
      const [result] = await pool.execute("DELETE FROM alumno WHERE id_alumno=?", [id]);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Alumno no encontrado" });
      }
      res.json({ success: true, data: id });
    } catch (err) {
      console.error("Error al eliminar alumno:", err);
      res.status(500).json({ success: false, message: "Error al eliminar alumno" });
    }
  }
);

export default router;
