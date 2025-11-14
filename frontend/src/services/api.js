const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : null
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token')
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    let msg = data?.message || data?.error || res.statusText
    if (Array.isArray(data?.errores) && data.errores.length) {
      const details = data.errores.map(e => `${e.path || e.param}: ${e.msg}`).join(', ')
      msg = `${msg}: ${details}`
    }
    throw new Error(msg)
  }
  return data
}

// Auth
export const api = {
  async register({ nombre, email, password }) {
    return request('/auth/register', { method: 'POST', body: { nombre, email, password } })
  },
  async login({ email, password }) {
    return request('/auth/login', { method: 'POST', body: { email, password } })
  },

  // Alumnos
  async getAlumnos() {
    const res = await request('/alumnos', { auth: true })
    return res.alumnos
  },
  async getAlumno(id) {
    const res = await request(`/alumnos/${id}`, { auth: true })
    return res.alumno
  },
  async createAlumno({ nombre, apellido, dni }) {
    const res = await request('/alumnos', { method: 'POST', auth: true, body: { nombre, apellido, dni } })
    return res.alumno
  },
  async updateAlumno(id, { nombre, apellido, dni }) {
    const res = await request(`/alumnos/${id}`, { method: 'PUT', auth: true, body: { nombre, apellido, dni } })
    return res.alumno
  },
  async deleteAlumno(id) {
    return request(`/alumnos/${id}`, { method: 'DELETE', auth: true })
  },

  // Materias
  async getMaterias() {
    const res = await request('/materias', { auth: true })
    return res.materias
  },
  async getMateria(id) {
    const res = await request(`/materias/${id}`, { auth: true })
    return res.materia
  },
  async createMateria({ nombre, codigo, anio }) {
    const res = await request('/materias', { method: 'POST', auth: true, body: { nombre, codigo, anio } })
    return res.materia
  },
  async updateMateria(id, { nombre, codigo, anio }) {
    const res = await request(`/materias/${id}`, { method: 'PUT', auth: true, body: { nombre, codigo, anio } })
    return res.materia
  },
  async deleteMateria(id) {
    return request(`/materias/${id}`, { method: 'DELETE', auth: true })
  },

  // Notas
  async getNotas(alumnoId, materiaId) {
    const res = await request(`/notas/${alumnoId}/${materiaId}`, { auth: true })
    return res.notas
  },
  async getNotasByAlumno(alumnoId) {
    const res = await request(`/notas/alumno/${alumnoId}`, { auth: true })
    return res.notas
  },
  async getNotasByMateria(materiaId) {
    const res = await request(`/notas/materia/${materiaId}`, { auth: true })
    return res.notas
  },
  async getPromedio(alumnoId, materiaId) {
    const res = await request(`/notas/promedio/${alumnoId}/${materiaId}`, { auth: true })
    return res.promedio
  },
  async upsertNotas(alumnoId, materiaId, { nota1, nota2, nota3 }) {
    try {
      await request(`/notas/${alumnoId}/${materiaId}`, { method: 'PUT', auth: true, body: { nota1, nota2, nota3 } })
    } catch (e) {
      if (e.message?.toLowerCase().includes('no encontradas') || e.message?.includes('404')) {
        await request(`/notas/${alumnoId}/${materiaId}`, { method: 'POST', auth: true, body: { nota1, nota2, nota3 } })
      } else {
        throw e
      }
    }
  },
  async deleteNotas(alumnoId, materiaId) {
    return request(`/notas/${alumnoId}/${materiaId}`, { method: 'DELETE', auth: true })
  }
}
