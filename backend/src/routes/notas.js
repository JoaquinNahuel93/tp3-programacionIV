import express from "express";
import { pool } from "../config/db.js";
import { verificarAutenticacion } from "../middlewares/auth.js";
import { param, body } from "express-validator";
import { verificarValidaciones } from "../middlewares/validaciones.js";

const router = express.Router();

const validarAlumnoId = param("alumnoId").isInt({ min: 1 });
const validarMateriaId = param("materiaId").isInt({ min: 1 });

router.get(
  "/:alumnoId/:materiaId",
  verificarAutenticacion,
  validarAlumnoId,
  validarMateriaId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const alumnoId = Number(req.params.alumnoId);
      const materiaId = Number(req.params.materiaId);
      const [rows] = await pool.execute(
        "SELECT id_nota, alumno_id, materia_id, nota1, nota2, nota3 FROM nota WHERE alumno_id=? AND materia_id=?",
        [alumnoId, materiaId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Notas no encontradas" });
      }
      res.json({ success: true, notas: rows[0] });
    } catch (err) {
      console.error("Error al obtener notas:", err);
      res.status(500).json({ success: false, message: "Error al obtener notas" });
    }
  }
);

router.post(
  "/:alumnoId/:materiaId",
  verificarAutenticacion,
  validarAlumnoId,
  validarMateriaId,
  body("nota1").optional({ nullable: true }).isFloat({ min: 0, max: 10 }),
  body("nota2").optional({ nullable: true }).isFloat({ min: 0, max: 10 }),
  body("nota3").optional({ nullable: true }).isFloat({ min: 0, max: 10 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const alumnoId = Number(req.params.alumnoId);
      const materiaId = Number(req.params.materiaId);
      const { nota1 = null, nota2 = null, nota3 = null } = req.body;
      const [result] = await pool.execute(
        "INSERT INTO nota (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?,?,?,?,?)",
        [alumnoId, materiaId, nota1, nota2, nota3]
      );
      res.status(201).json({
        success: true,
        notas: { id: result.insertId, alumno_id: alumnoId, materia_id: materiaId, nota1, nota2, nota3 },
      });
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "Notas ya existen para alumno/materia" });
      }
      console.error("Error al crear notas:", err);
      res.status(500).json({ success: false, message: "Error al crear notas" });
    }
  }
);

router.put(
  "/:alumnoId/:materiaId",
  verificarAutenticacion,
  validarAlumnoId,
  validarMateriaId,
  body("nota1").optional({ nullable: true }).isFloat({ min: 0, max: 10 }),
  body("nota2").optional({ nullable: true }).isFloat({ min: 0, max: 10 }),
  body("nota3").optional({ nullable: true }).isFloat({ min: 0, max: 10 }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const alumnoId = Number(req.params.alumnoId);
      const materiaId = Number(req.params.materiaId);
      const { nota1 = null, nota2 = null, nota3 = null } = req.body;
      const [result] = await pool.execute(
        "UPDATE nota SET nota1=?, nota2=?, nota3=? WHERE alumno_id=? AND materia_id=?",
        [nota1, nota2, nota3, alumnoId, materiaId]
      );
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Notas no encontradas" });
      }
      res.json({ success: true, notas: { alumno_id: alumnoId, materia_id: materiaId, nota1, nota2, nota3 } });
    } catch (err) {
      console.error("Error al actualizar notas:", err);
      res.status(500).json({ success: false, message: "Error al actualizar notas" });
    }
  }
);

// Listar todas las notas de un alumno
router.get(
  "/alumno/:alumnoId",
  verificarAutenticacion,
  validarAlumnoId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const alumnoId = Number(req.params.alumnoId);
      const [rows] = await pool.execute(
        "SELECT n.id_nota, n.alumno_id, n.materia_id, m.nombre AS materia, n.nota1, n.nota2, n.nota3 FROM nota n JOIN materia m ON n.materia_id=m.id_materia WHERE n.alumno_id=? ORDER BY m.nombre",
        [alumnoId]
      );
      res.json({ success: true, notas: rows });
    } catch (err) {
      console.error("Error al listar notas por alumno:", err);
      res.status(500).json({ success: false, message: "Error al listar notas" });
    }
  }
);

// Listar todas las notas de una materia
router.get(
  "/materia/:materiaId",
  verificarAutenticacion,
  validarMateriaId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const materiaId = Number(req.params.materiaId);
      const [rows] = await pool.execute(
        "SELECT n.id_nota, n.alumno_id, n.materia_id, a.apellido, a.nombre, n.nota1, n.nota2, n.nota3 FROM nota n JOIN alumno a ON n.alumno_id=a.id_alumno WHERE n.materia_id=? ORDER BY a.apellido, a.nombre",
        [materiaId]
      );
      res.json({ success: true, notas: rows });
    } catch (err) {
      console.error("Error al listar notas por materia:", err);
      res.status(500).json({ success: false, message: "Error al listar notas" });
    }
  }
);

// Promedio de notas para un alumno en una materia
router.get(
  "/promedio/:alumnoId/:materiaId",
  verificarAutenticacion,
  validarAlumnoId,
  validarMateriaId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const alumnoId = Number(req.params.alumnoId);
      const materiaId = Number(req.params.materiaId);
      const [rows] = await pool.execute(
        "SELECT nota1, nota2, nota3 FROM nota WHERE alumno_id=? AND materia_id=?",
        [alumnoId, materiaId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Notas no encontradas" });
      }
      const { nota1, nota2, nota3 } = rows[0];
      const valores = [nota1, nota2, nota3].filter((n) => n !== null && n !== undefined);
      const promedio = valores.length ? valores.reduce((a, b) => a + Number(b), 0) / valores.length : null;
      res.json({ success: true, promedio });
    } catch (err) {
      console.error("Error al calcular promedio:", err);
      res.status(500).json({ success: false, message: "Error al calcular promedio" });
    }
  }
);

// Eliminar notas para un alumno/materia
router.delete(
  "/:alumnoId/:materiaId",
  verificarAutenticacion,
  validarAlumnoId,
  validarMateriaId,
  verificarValidaciones,
  async (req, res) => {
    try {
      const alumnoId = Number(req.params.alumnoId);
      const materiaId = Number(req.params.materiaId);
      const [result] = await pool.execute(
        "DELETE FROM nota WHERE alumno_id=? AND materia_id=?",
        [alumnoId, materiaId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Notas no encontradas" });
      }
      res.json({ success: true, data: { alumno_id: alumnoId, materia_id: materiaId } });
    } catch (err) {
      console.error("Error al eliminar notas:", err);
      res.status(500).json({ success: false, message: "Error al eliminar notas" });
    }
  }
);

export default router;
