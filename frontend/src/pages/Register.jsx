import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(''); setOk('')
    // Validaciones cliente simples para evitar 400 innecesarios
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Email inválido')
      return
    }
    if (password.length < 8 || !/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres y un número')
      return
    }
    try {
      await api.register({ nombre, email, password })
      setOk('Usuario registrado. Ahora podés iniciar sesión.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <article style={{ maxWidth: 520, margin: '32px auto' }}>
      <h2>Registro</h2>
      <form onSubmit={onSubmit} className="grid">
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Contraseña
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} />
        </label>
        {error && <small style={{ color: 'var(--del-color)' }}>{error}</small>}
        {ok && <small style={{ color: 'var(--ins-color)' }}>{ok}</small>}
        <button type="submit">Crear cuenta</button>
      </form>
      <footer>
        <small>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </small>
      </footer>
    </article>
  )
}
