import express from "express";
import cors from "cors";
import 'dotenv/config';
import passport from "passport";
import { pool } from "./config/db.js";
import { authConfig } from "./middlewares/auth.js";
import authRouter from "./routes/auth.js";
import alumnosRouter from "./routes/alumnos.js";
import materiasRouter from "./routes/materias.js";
import notasRouter from "./routes/notas.js";
import { notFound, errorHandler } from "./middlewares/errors.js";

const app = express();

app.use(express.json());
app.use(cors());

authConfig();
app.use(passport.initialize());

app.get("/", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT 1 + 1 AS resultado");
    res.json({ conexion: "exitosa", resultado: result[0].resultado });
  } catch (err) {
    console.error("Error al conectar a la base:", err);
    res.status(500).json({ error: "Error de conexión a la base de datos" });
  }
});

app.use("/auth", authRouter);
app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);
app.use("/notas", notasRouter);

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);

// Middlewares de error y 404
app.use(notFound);
app.use(errorHandler);
