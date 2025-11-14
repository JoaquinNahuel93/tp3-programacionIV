import React from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Alumnos from './pages/Alumnos.jsx'
import Materias from './pages/Materias.jsx'
import Notas from './pages/Notas.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function NavBar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <nav className="container-fluid">
      <ul>
        <li><strong>Gestión de Alumnos</strong></li>
      </ul>
      <ul>
        <li><Link to="/alumnos">Alumnos</Link></li>
        <li><Link to="/materias">Materias</Link></li>
        <li><Link to="/notas">Notas</Link></li>
        <li>
          {token ? <button onClick={logout} className="secondary">Salir</button> : <Link to="/login">Login</Link>}
        </li>
      </ul>
    </nav>
  )
}

export default function App() {
  return (
    <>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/alumnos" element={<ProtectedRoute><Alumnos /></ProtectedRoute>} />
          <Route path="/materias" element={<ProtectedRoute><Materias /></ProtectedRoute>} />
          <Route path="/notas" element={<ProtectedRoute><Notas /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/alumnos" replace />} />
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </main>
    </>
  )
}
