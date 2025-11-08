# Trabajo Práctico N.º 3 - Universidad Tecnológica Nacional – Facultad Regional La Rioja
Tecnicatura Universitaria en Programación
Programación IV

Requerimientos generales
•
Frontend:
◦
Framework: Vite + React (JavaScript).
◦
Formulario de inicio de sesión y registro de usuario.
◦
Comunicación con el backend mediante fetch consumiendo una API REST JSON.
◦
Validaciones en el frontend (campos obligatorios, formato de datos, etc.).
•
Backend:
◦
Framework: Express.js.
◦
Base de datos: MySQL (con conexión mediante mysql2).
◦
Validaciones de datos con express-validator en todas las rutas de obtención, creación y actualización.
◦
Manejo de errores con respuestas HTTP adecuadas (400, 401, 403, 404, 500).
◦
Incluir archivos ‘http’ para prueba de la API.
◦
Incluir archivo sql con las definiciones de las tablas.
•
Autenticación y autorización:
◦
Registro e inicio de sesión de usuarios.
◦
Autenticación mediante JWT (JSON Web Tokens).
◦
Middleware de Passport para verificar el token y restringir acceso a rutas protegidas.
◦
Solo los usuarios autenticados pueden acceder a las operaciones CRUD.
•
Seguridad:
◦
Las contraseñas deben almacenarse encriptadas con bcrypt.
◦
No deben enviarse contraseñas en texto plano.
◦
Los tokens JWT deben expirar a las 4 horas.

Gestión de alumno, materias y notas
Desarrollar una aplicación web completa que permita gestionar alumnos, materias y sus calificaciones. A parte de los requisitos generales el ejercicio debe cumplir lo siguiente:
•
Frontend:
◦
Pantalla principal con paginas de:
▪
Listado de alumnos.
▪
Listado de materias.
▪
Carga y visualización de notas por alumno y materia (hasta 3 notas).
◦
Formularios para alta, modificación y eliminación de alumnos y materias.
◦
Posibilidad de asignar notas a cada alumno en cada materia.
◦
Mostrar el promedio de notas por materia y alumno.
•
Backend:
◦
Estructura de entidades:
▪
Usuario: id, nombre, email, contraseña (encriptada con bcrypt).
▪
Alumno: id, nombre, apellido, DNI (único).
▪
Materia: id, nombre, código, año.
▪
Nota: id, alumno_id, materia_id, nota1, nota2, nota3.
