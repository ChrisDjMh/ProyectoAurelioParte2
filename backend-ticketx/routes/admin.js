const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_usuarios }]] = await pool.query(
      "SELECT COUNT(*) as total_usuarios FROM usuarios"
    );
    const [[{ eventos_activos }]] = await pool.query(
      "SELECT COUNT(*) as eventos_activos FROM eventos WHERE estado = 'publicado'"
    );
    const [[{ organizadores_pendientes }]] = await pool.query(
      "SELECT COUNT(*) as organizadores_pendientes FROM organizadores WHERE estado = 0"
    );

    res.json({ total_usuarios, eventos_activos, organizadores_pendientes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
});

// GET /api/admin/usuarios — todos los usuarios y organizadores aprobados
router.get('/usuarios', async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      "SELECT id, nombre, email, tipo, created_at FROM usuarios ORDER BY created_at DESC"
    );
    const [organizadores] = await pool.query(
      "SELECT id, nombre, email, negocio, telefono, estado, created_at FROM organizadores ORDER BY created_at DESC"
    );
    res.json({ usuarios, organizadores });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

// GET /api/admin/organizadores-pendientes
router.get('/organizadores-pendientes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, email, telefono, negocio, descripcion, created_at 
       FROM organizadores WHERE estado = 0 ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pendientes' });
  }
});

// PATCH /api/admin/organizadores/:id/aprobar
router.patch('/organizadores/:id/aprobar', async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE organizadores SET estado = 1 WHERE id = ? AND estado = 0",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ mensaje: 'Organizador no encontrado o ya aprobado' });
    res.json({ mensaje: 'Organizador aprobado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al aprobar organizador' });
  }
});

// PATCH /api/admin/organizadores/:id/rechazar  
router.patch('/organizadores/:id/rechazar', async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM organizadores WHERE id = ? AND estado = 0",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ mensaje: 'Organizador no encontrado' });
    res.json({ mensaje: 'Solicitud rechazada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al rechazar organizador' });
  }
});

// DELETE /api/admin/usuarios/:id
router.delete('/usuarios/:id', async (req, res) => {
  try {
    await pool.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

module.exports = router;