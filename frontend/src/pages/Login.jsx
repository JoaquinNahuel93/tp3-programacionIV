import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.login({ email, password })
      localStorage.setItem('token', res.token)
      navigate('/alumnos')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <article style={{ maxWidth: 520, margin: '32px auto' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit} className="grid">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Contraseña
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        {error && <small style={{ color: 'var(--del-color)' }}>{error}</small>}
        <button type="submit">Entrar</button>
      </form>
      <footer>
        <small>
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </small>
      </footer>
    </article>
  )
}
