import bcrypt from 'bcrypt'
import { pool } from './config/db.js'
import { getPasswordColumn } from './utils/passwordColumn.js'

async function debugDb() {
  try {
    const [[{ db }]] = await pool.query('SELECT DATABASE() AS db')
    console.log('DB activa:', db)
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='usuario' ORDER BY ORDINAL_POSITION"
    )
    console.log('usuario columnas:', cols.map(c => c.COLUMN_NAME).join(', ') || '(sin columnas)')
  } catch (e) {
    console.log('No se pudo inspeccionar la DB:', e?.message)
  }
}

async function ensureUsuario({ nombre, email, password }) {
  const [rows] = await pool.execute('SELECT id_usuario FROM usuario WHERE email=?', [email])
  if (rows.length > 0) return rows[0].id_usuario
  const hash = await bcrypt.hash(password, 12)
  const passCol = await getPasswordColumn()
  const sql = `INSERT INTO usuario (nombre, email, ${passCol}) VALUES (?,?,?)`
  const [res] = await pool.execute(sql, [nombre, email, hash])
  return res.insertId
}

async function ensureAlumno({ nombre, apellido, dni }) {
  const [rows] = await pool.execute('SELECT id_alumno FROM alumno WHERE dni=?', [dni])
  if (rows.length > 0) return rows[0].id_alumno
  const [res] = await pool.execute(
    'INSERT INTO alumno (nombre, apellido, dni) VALUES (?,?,?)',
    [nombre, apellido, dni]
  )
  return res.insertId
}

async function ensureMateria({ nombre, codigo, anio }) {
  const [rows] = await pool.execute('SELECT id_materia FROM materia WHERE codigo=?', [codigo])
  if (rows.length > 0) return rows[0].id_materia
  const [res] = await pool.execute(
    'INSERT INTO materia (nombre, codigo, anio) VALUES (?,?,?)',
    [nombre, codigo, anio]
  )
  return res.insertId
}

async function ensureNota({ alumnoDni, materiaCodigo, nota1 = null, nota2 = null, nota3 = null }) {
  const [[a]] = await pool.execute('SELECT id_alumno FROM alumno WHERE dni=?', [alumnoDni])
  const [[m]] = await pool.execute('SELECT id_materia FROM materia WHERE codigo=?', [materiaCodigo])
  if (!a || !m) return
  await pool.execute(
    'INSERT INTO nota (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE alumno_id=alumno_id',
    [a.id_alumno, m.id_materia, nota1, nota2, nota3]
  )
}

async function main() {
  console.log('Seeding datos de ejemplo...')
  await debugDb()
  await ensureUsuario({ nombre: 'Demo', email: 'demo@example.com', password: 'hola1234' })

  await ensureAlumno({ nombre: 'Ana', apellido: 'Pérez', dni: '12345678' })
  await ensureAlumno({ nombre: 'Carlos', apellido: 'Gómez', dni: '23456789' })
  await ensureAlumno({ nombre: 'Lucía', apellido: 'Rodríguez', dni: '34567890' })

  await ensureMateria({ nombre: 'Matemática I', codigo: 'MAT1', anio: 1 })
  await ensureMateria({ nombre: 'Historia', codigo: 'HIS1', anio: 1 })
  await ensureMateria({ nombre: 'Programación', codigo: 'PROG1', anio: 1 })

  await ensureNota({ alumnoDni: '12345678', materiaCodigo: 'MAT1', nota1: 8, nota2: 7, nota3: 9 })
  await ensureNota({ alumnoDni: '23456789', materiaCodigo: 'MAT1', nota1: 6, nota2: 7, nota3: 6 })
  await ensureNota({ alumnoDni: '34567890', materiaCodigo: 'HIS1', nota1: 9, nota2: 8, nota3: 8 })

  console.log('Seed completo.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Error en seed:', err)
  process.exit(1)
})
