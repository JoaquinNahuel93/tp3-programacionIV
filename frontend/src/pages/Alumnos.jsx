import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [form, setForm] = useState({ id: null, nombre: '', apellido: '', dni: '' })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await api.getAlumnos()
      setAlumnos(data)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // Validación cliente simple de DNI (7 a 10 dígitos)
      if (!/^\d{7,10}$/.test(String(form.dni).trim())) {
        setError('DNI inválido (usar 7 a 10 dígitos)')
        return
      }
      if (form.id) {
        await api.updateAlumno(form.id, { nombre: form.nombre, apellido: form.apellido, dni: form.dni })
      } else {
        await api.createAlumno({ nombre: form.nombre, apellido: form.apellido, dni: form.dni })
      }
      setForm({ id: null, nombre: '', apellido: '', dni: '' })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  const onEdit = (a) => setForm({ id: a.id_alumno, nombre: a.nombre, apellido: a.apellido, dni: a.dni })
  const onDelete = async (id) => { await api.deleteAlumno(id); load() }

  return (
    <section>
      <header>
        <h2>Alumnos</h2>
      </header>
      {error && <small style={{ color: 'var(--del-color)' }}>{error}</small>}
      <form onSubmit={onSubmit} className="grid" style={{ maxWidth: 700 }}>
        <label>
          Nombre
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </label>
        <label>
          Apellido
          <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
        </label>
        <label>
          DNI
          <input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} required pattern="\d{7,10}" title="Usar 7 a 10 dígitos" />
        </label>
        <div>
          <button type="submit">{form.id ? 'Guardar cambios' : 'Crear'}</button>
          {form.id && <button type="button" className="secondary" onClick={() => setForm({ id: null, nombre: '', apellido: '', dni: '' })}>Cancelar</button>}
        </div>
      </form>

      <table className="striped" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Apellido</th><th>DNI</th><th></th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map(a => (
            <tr key={a.id_alumno}>
              <td>{a.id_alumno}</td>
              <td>{a.nombre}</td>
              <td>{a.apellido}</td>
              <td>{a.dni}</td>
              <td>
                <button onClick={() => onEdit(a)}>Editar</button>{' '}
                <button className="secondary" onClick={() => onDelete(a.id_alumno)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
