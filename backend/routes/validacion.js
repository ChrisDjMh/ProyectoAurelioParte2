const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/escanear', async (req, res) => {
  const { codigo_qr } = req.body;

  if (!codigo_qr) {
    return res.status(400).json({ valido: false, mensaje: 'Código QR requerido' });
  }

  try {
    const partes = codigo_qr.split('-');
    const evento_id = partes[1]; 

    if (!evento_id || isNaN(evento_id)) {
        return res.status(400).json({ valido: false, mensaje: 'Formato de QR no válido.' });
    }

    const [boletosEvento] = await pool.query(
      `SELECT b.*, e.titulo, e.fecha, e.ubicacion
       FROM boletos b
       JOIN eventos e ON b.evento_id = e.id
       WHERE b.evento_id = ?`,
      [evento_id]
    );

    if (boletosEvento.length === 0) {
      return res.status(404).json({ valido: false, mensaje: 'Evento no encontrado o sin boletos emitidos.' });
    }

   
    const qrFormateado = `-${codigo_qr}-`;
    const boletosAValidar = boletosEvento.filter(boleto => 
        qrFormateado.includes(`-${boleto.asiento}-`)
    );

    if (boletosAValidar.length === 0) {
      return res.status(404).json({ valido: false, mensaje: '❌ No se encontraron los asientos de este QR en la base de datos.' });
    }

    const infoEvento = boletosAValidar[0];
    const ahora = new Date();
    const fechaEvento = new Date(infoEvento.fecha);

    const inicioVentana = new Date(fechaEvento);
    inicioVentana.setDate(inicioVentana.getDate() - 1); 

    const finVentana = new Date(fechaEvento);
    finVentana.setHours(finVentana.getHours() + 4); 

    if (ahora < inicioVentana) {
      return res.status(400).json({ valido: false, mensaje: ' Aún no es tiempo para ingresar a este evento.' });
    }
    if (ahora > finVentana) {
      return res.status(400).json({ valido: false, mensaje: '❌ Este evento ya ha terminado.' });
    }

    const cancelados = boletosAValidar.filter(b => b.estado === 'cancelado');
    if (cancelados.length > 0) {
      return res.status(400).json({ valido: false, mensaje: '❌ Algunos boletos de este QR están cancelados.' });
    }

    const noPagados = boletosAValidar.filter(b => b.estado !== 'pagado' && b.estado !== 'usado');
    if (noPagados.length > 0) {
      return res.status(400).json({ valido: false, mensaje: '❌ Hay boletos en este QR que no están pagados.' });
    }

    const yaUsados = boletosAValidar.filter(b => b.estado === 'usado');
    
    if (yaUsados.length === boletosAValidar.length) {
      return res.status(409).json({ 
          valido: false, 
          mensaje: '⚠️ TODOS los boletos de este código QR ya fueron utilizados.' 
      });
    }

    const boletosParaIngresar = boletosAValidar.filter(b => b.estado === 'pagado');
    const idsParaActualizar = boletosParaIngresar.map(b => b.id);

    if (idsParaActualizar.length > 0) {
      const placeholders = idsParaActualizar.map(() => '?').join(',');
      
      await pool.query(
        `UPDATE boletos SET estado = 'usado', usado_at = NOW() WHERE id IN (${placeholders})`,
        idsParaActualizar
      );
    }

    const nombresAsientos = boletosParaIngresar.map(b => b.asiento).join(', ');

    return res.json({
      valido: true,
      mensaje: `✅ Acceso permitido para ${boletosParaIngresar.length} persona(s).`,
      evento: infoEvento.titulo,
      asientos_ingresando: nombresAsientos,
      ya_habian_entrado: yaUsados.length, 
      ubicacion: infoEvento.ubicacion
    });

  } catch (error) {
    console.error('Error al validar QR grupal:', error);
    res.status(500).json({ valido: false, mensaje: 'Error interno del servidor.' });
  }
});

module.exports = router;