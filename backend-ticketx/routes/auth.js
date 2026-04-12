const express = require('express');
const router = express.Router();
const pool = require('../db');

const rolesMap = {
  usuarios: 'usuario',
  organizadores: 'organizador',
  administradores: 'administrador',
};

// Columnas requeridas por tabla para el registro
const camposRegistro = {
  usuarios: ['nombre', 'email', 'password'],
  organizadores: ['nombre', 'email', 'password', 'telefono', 'negocio'],
};

// ─── LOGIN ─────────────────────────────────────────────────────────
// POST /api/auth/:rol/login
router.post('/:rol/login', async (req, res) => {
  const { rol } = req.params;
  const { email, password } = req.body;

  if (!rolesMap[rol]) {
    return res.status(400).json({ mensaje: 'Rol no válido' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${rol} WHERE email = ? AND password = ?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // ✅ Bloquear organizadores no aprobados
if (rol === 'organizadores' && rows[0].estado === 0) {
  return res.status(403).json({ 
    mensaje: 'Tu cuenta está pendiente de aprobación. El administrador te notificará pronto.' 
  });
}

    const usuarioRaw = { ...rows[0] };
    delete usuarioRaw.password;

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuarioRaw.id,
        nombre: usuarioRaw.nombre,
        email: usuarioRaw.email,
        role: rolesMap[rol],
        tipo: usuarioRaw.tipo || 'Normal',
      },
      token: 'jwt_token_simulado_123',
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno en el servidor' });
  }
});

// ─── REGISTRO ──────────────────────────────────────────────────────
// POST /api/auth/:rol/registro
// Solo permitido para usuarios y organizadores (no admins)
router.post('/:rol/registro', async (req, res) => {
  const { rol } = req.params;

  // Los administradores no se pueden registrar desde el frontend
  if (rol === 'administradores') {
    return res.status(403).json({ mensaje: 'El registro de administradores no está permitido' });
  }

  if (!camposRegistro[rol]) {
    return res.status(400).json({ mensaje: 'Rol no válido para registro' });
  }

  const { nombre, email, password, telefono, negocio } = req.body;

  // Validar que los campos requeridos estén presentes
  const camposRequeridos = camposRegistro[rol];
  for (const campo of camposRequeridos) {
    if (!req.body[campo]) {
      return res.status(400).json({ mensaje: `El campo '${campo}' es obligatorio` });
    }
  }

  try {
    // Verificar si el email ya existe en esa tabla
    const [existe] = await pool.query(
      `SELECT id FROM ${rol} WHERE email = ?`,
      [email]
    );

    if (existe.length > 0) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });
    }

    // Insertar según el rol
    if (rol === 'usuarios') {
      await pool.query(
        `INSERT INTO usuarios (nombre, email, password, tipo) VALUES (?, ?, ?, 'Normal')`,
        [nombre, email, password]
      );
    } else if (rol === 'organizadores') {
      await pool.query(
        `INSERT INTO organizadores (nombre, email, password, telefono, negocio, estado) VALUES (?, ?, ?, ?, ?, 0)`,
        [nombre, email, password, telefono || '', negocio || '']
      );
    }

    res.status(201).json({ mensaje: '¡Cuenta creada exitosamente!' });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error interno en el servidor' });
  }
});


router.post('/me', async (req, res) => {
  const { id, role } = req.body;

  if (!id || !role) {
    return res.status(400).json({ mensaje: 'Faltan datos de sesión' });
  }

  // Buscar en qué tabla está basado en el rol (usuarios, organizadores, etc.)
  const tabla = Object.keys(rolesMap).find(key => rolesMap[key] === role);
  if (!tabla) return res.status(400).json({ mensaje: 'Rol no válido' });

  try {
    const [rows] = await pool.query(`SELECT * FROM ${tabla} WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuarioRaw = { ...rows[0] };
    delete usuarioRaw.password;

    res.json({
      usuario: {
        id: usuarioRaw.id,
        nombre: usuarioRaw.nombre,
        email: usuarioRaw.email,
        role: role,
        tipo: usuarioRaw.tipo || 'Normal', // Aquí la BD nos dirá si ya es Premium
      }
    });
  } catch (error) {
    console.error('Error obteniendo sesión fresca:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;