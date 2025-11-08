import express from "express";
import { pool } from "./config/db.js";

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT 1 + 1 AS resultado");
    res.json({ conexion: "exitosa", resultado: result[0].resultado });
  } catch (err) {
    console.error("Error al conectar a la base:", err);
    res.status(500).json({ error: "Error de conexión a la base de datos" });
  }
});
//Prueba de conexión
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
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

