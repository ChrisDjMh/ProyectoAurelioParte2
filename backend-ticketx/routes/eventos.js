const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ruta para obtener todos los eventos publicados (Ideal para mapear en tus EventCard.tsx)
// Ruta pública: Obtener todos los eventos publicados (Para el Home / Catálogo)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.*, 
                (SELECT COUNT(*) FROM boletos b WHERE b.evento_id = e.id AND b.estado IN ('pagado', 'usado')) AS boletos_vendidos
            FROM eventos e 
            WHERE e.estado = 'publicado'
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los eventos' });
    }
});

// NUEVA RUTA: Obtener todos los eventos de un organizador específico (Para tu Dashboard)
router.get('/organizador/:organizador_id', async (req, res) => {
    try {
        const { organizador_id } = req.params;
        const query = `
            SELECT 
                e.*, 
                (SELECT COUNT(*) FROM boletos b WHERE b.evento_id = e.id AND b.estado IN ('pagado', 'usado')) AS boletos_vendidos
            FROM eventos e 
            WHERE e.organizador_id = ?
        `;
        // Aquí no filtramos por 'estado', así traemos borradores, publicados, etc.
        const [rows] = await pool.query(query, [organizador_id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los eventos del organizador' });
    }
});

// ── POST /api/eventos — Crear evento (solo organizadores) ──────────
router.post('/', async (req, res) => {
  const {
    organizador_id,
    titulo,
    descripcion,
    fecha,       // viene como "2026-06-15T20:00" (datetime-local del form)
    ubicacion,
    capacidad,
    precio,
    imagen,      // URL de la imagen
    imagen_banner,
    categoria,
    estado       // 'borrador' o 'publicado'
  } = req.body;

  // Validaciones básicas en backend
  if (!organizador_id || !titulo || !fecha || !ubicacion || !capacidad || !precio) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  if (isNaN(Number(capacidad)) || Number(capacidad) <= 0) {
    return res.status(400).json({ mensaje: 'La capacidad debe ser un número positivo' });
  }

  if (isNaN(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({ mensaje: 'El precio no puede ser negativo' });
  }

  for (const [campo, url] of [['imagen', imagen], ['imagen_banner', imagen_banner]]) {
    if (url && url.trim() !== '') {
      try { new URL(url); }
      catch { return res.status(400).json({ mensaje: `La URL de ${campo} no es válida` }); }
    }
  }

  // Validar que la imagen sea una URL válida (si se proporcionó)
  if (imagen && imagen.trim() !== '') {
    try {
      new URL(imagen);
    } catch {
      return res.status(400).json({ mensaje: 'La URL de la imagen no es válida' });
    }
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO eventos 
        (organizador_id, titulo, descripcion, fecha, ubicacion, capacidad, precio, imagen, imagen_banner, categoria, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizador_id,
        titulo.trim(),
        descripcion?.trim() || null,
        fecha,
        ubicacion.trim(),
        Number(capacidad),
        Number(precio),
        imagen?.trim() || null,
        imagen_banner?.trim() || null,
        categoria || 'Otros',
        estado || 'borrador'
      ]
    );

    res.status(201).json({
      mensaje: 'Evento creado exitosamente',
      evento_id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ mensaje: 'Error interno al crear el evento' });
  }
});



// Ruta para obtener un evento específico por ID (Para tu EventDetail.tsx)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM eventos WHERE id = ?", [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Evento no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el evento' });
    }
});


router.get('/:id/asientos-ocupados', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Consultar la capacidad real del evento
        const [evento] = await pool.query("SELECT capacidad FROM eventos WHERE id = ?", [id]);
        
        if (evento.length === 0) {
            return res.status(404).json({ mensaje: 'Evento no encontrado' });
        }
        
        const capacidadReal = evento[0].capacidad;

        // 2. Consultar los asientos ya vendidos o reservados
        const [boletos] = await pool.query(
            "SELECT asiento FROM boletos WHERE evento_id = ? AND estado IN ('pagado', 'reservado')", 
            [id]
        );
        
        const asientosOcupados = boletos.map(row => row.asiento);
        
        // 3. Enviar ambos datos al frontend
        res.json({ 
            capacidad: capacidadReal, 
            asientosOcupados: asientosOcupados 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los datos del evento' });
    }
});




module.exports = router;