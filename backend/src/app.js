import express from "express";
import { pool } from "./config/db.js";

const app = express();
app.use(express.json());

// Ruta para listar alumnos
app.get("/alumnos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM alumno");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener alumnos:", err);
    res.status(500).json({ error: "Error al obtener alumnos" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
