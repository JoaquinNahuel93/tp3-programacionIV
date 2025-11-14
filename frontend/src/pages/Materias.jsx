import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Materias() {
  const [materias, setMaterias] = useState([])
  const [form, setForm] = useState({ id: null, nombre: '', codigo: '', anio: 1 })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await api.getMaterias()
      setMaterias(data)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const anioNum = Number(form.anio)
      if (!Number.isInteger(anioNum) || anioNum <= 0) {
        setError('Año inválido (debe ser entero positivo)')
        return
      }
      if (!/^\S+$/.test(String(form.codigo))) {
        setError('Código inválido (no debe contener espacios)')
        return
      }
      if (form.id) {
        await api.updateMateria(form.id, { nombre: form.nombre, codigo: form.codigo, anio: anioNum })
      } else {
        await api.createMateria({ nombre: form.nombre, codigo: form.codigo, anio: anioNum })
      }
      setForm({ id: null, nombre: '', codigo: '', anio: 1 })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  const onEdit = (m) => setForm({ id: m.id_materia, nombre: m.nombre, codigo: m.codigo, anio: m.anio })
  const onDelete = async (id) => { await api.deleteMateria(id); load() }

  return (
    <section>
      <header>
        <h2>Materias</h2>
      </header>
      {error && <small style={{ color: 'var(--del-color)' }}>{error}</small>}
      <form onSubmit={onSubmit} className="grid" style={{ maxWidth: 700 }}>
        <label>
          Nombre
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </label>
        <label>
          Código
          <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required pattern="\S+" title="Sin espacios" />
        </label>
        <label>
          Año
          <input type="number" min="1" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} required />
        </label>
        <div>
          <button type="submit">{form.id ? 'Guardar cambios' : 'Crear'}</button>
          {form.id && <button type="button" className="secondary" onClick={() => setForm({ id: null, nombre: '', codigo: '', anio: 1 })}>Cancelar</button>}
        </div>
      </form>

      <table className="striped" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Código</th><th>Año</th><th></th>
          </tr>
        </thead>
        <tbody>
          {materias.map(m => (
            <tr key={m.id_materia}>
              <td>{m.id_materia}</td>
              <td>{m.nombre}</td>
              <td>{m.codigo}</td>
              <td>{m.anio}</td>
              <td>
                <button onClick={() => onEdit(m)}>Editar</button>{' '}
                <button className="secondary" onClick={() => onDelete(m.id_materia)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
