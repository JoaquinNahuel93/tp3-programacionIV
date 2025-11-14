import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

export default function Notas() {
  const [alumnos, setAlumnos] = useState([])
  const [materias, setMaterias] = useState([])
  const [alumnoId, setAlumnoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [notas, setNotas] = useState({ nota1: '', nota2: '', nota3: '' })
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setAlumnos(await api.getAlumnos())
        setMaterias(await api.getMaterias())
      } catch (e) { setError(e.message) }
    })()
  }, [])

  const promedio = useMemo(() => {
    const values = [notas.nota1, notas.nota2, notas.nota3]
      .map(v => v === '' ? null : Number(v))
      .filter(v => v !== null && !isNaN(v))
    if (!values.length) return ''
    const sum = values.reduce((a,b) => a + b, 0)
    return (sum / values.length).toFixed(2)
  }, [notas])

  const cargarExistentes = async () => {
    setError(''); setOk('')
    if (!alumnoId || !materiaId) return
    try {
      const current = await api.getNotas(alumnoId, materiaId)
      setNotas({
        nota1: current.nota1 ?? '',
        nota2: current.nota2 ?? '',
        nota3: current.nota3 ?? ''
      })
    } catch (e) {
      setNotas({ nota1: '', nota2: '', nota3: '' })
    }
  }

  useEffect(() => { cargarExistentes() }, [alumnoId, materiaId])

  const guardar = async () => {
    setError(''); setOk('')
    if (!alumnoId || !materiaId) { setError('Seleccioná alumno y materia'); return }
    const payload = {
      nota1: notas.nota1 === '' ? null : Number(notas.nota1),
      nota2: notas.nota2 === '' ? null : Number(notas.nota2),
      nota3: notas.nota3 === '' ? null : Number(notas.nota3)
    }
    try {
      await api.upsertNotas(alumnoId, materiaId, payload)
      setOk('Notas guardadas')
    } catch (e) {
      setError(e.message)
    }
  }

  const eliminar = async () => {
    setError(''); setOk('')
    if (!alumnoId || !materiaId) { setError('Seleccioná alumno y materia'); return }
    try {
      await api.deleteNotas(alumnoId, materiaId)
      setNotas({ nota1: '', nota2: '', nota3: '' })
      setOk('Notas eliminadas')
    } catch (e) { setError(e.message) }
  }

  return (
    <section>
      <header>
        <h2>Notas</h2>
      </header>
      {error && <small style={{ color: 'var(--del-color)' }}>{error}</small>}
      {ok && <small style={{ color: 'var(--ins-color)' }}>{ok}</small>}
      <form className="grid" onSubmit={(e) => e.preventDefault()}>
        <label>
          Alumno
          <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
            <option value="">-- Seleccioná --</option>
            {alumnos.map(a => <option key={a.id_alumno} value={a.id_alumno}>{a.apellido}, {a.nombre}</option>)}
          </select>
        </label>
        <label>
          Materia
          <select value={materiaId} onChange={e => setMateriaId(e.target.value)}>
            <option value="">-- Seleccioná --</option>
            {materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre} ({m.codigo})</option>)}
          </select>
        </label>
      </form>
      <form className="grid" onSubmit={(e) => e.preventDefault()}>
        <label>
          Nota 1
          <input type="number" min="0" max="10" step="0.01" value={notas.nota1} onChange={e => setNotas({ ...notas, nota1: e.target.value })} />
        </label>
        <label>
          Nota 2
          <input type="number" min="0" max="10" step="0.01" value={notas.nota2} onChange={e => setNotas({ ...notas, nota2: e.target.value })} />
        </label>
        <label>
          Nota 3
          <input type="number" min="0" max="10" step="0.01" value={notas.nota3} onChange={e => setNotas({ ...notas, nota3: e.target.value })} />
        </label>
      </form>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={guardar}>Guardar</button>
        <button className="secondary" onClick={eliminar}>Eliminar</button>
        <span>Promedio: <strong>{promedio || '-'}</strong></span>
      </div>
    </section>
  )
}
