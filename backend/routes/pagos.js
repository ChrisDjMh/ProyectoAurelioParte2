const express = require('express');
const router = express.Router();
const pool = require('../db');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { SeatsioClient, Region } = require('seatsio');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"TicketX" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('Error al enviar email:', err.message);
  }
};

router.post('/crear-intent', async (req, res) => {
  const { evento_id, usuario_id, asientos, hold_token, total, email_usuario, orden_id } = req.body;

  try {
    if (orden_id) {
      const [[orden]] = await pool.query(
        'SELECT * FROM ordenes WHERE id = ? AND usuario_id = ? AND estado = "pendiente" LIMIT 1',
        [orden_id, usuario_id]
      );

      if (!orden) {
        return res.status(404).json({ mensaje: 'Orden no encontrada o ya fue procesada' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'mxn',
        receipt_email: email_usuario,
        metadata: { orden_id: orden_id.toString(), evento_id }
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        orden_id: orden.id,
      });
    }

    const placeholders = asientos.map(() => '?').join(',');
    const [asientosOcupados] = await pool.query(
      `SELECT b.asiento FROM boletos b
       JOIN ordenes o ON b.orden_id = o.id
       WHERE b.evento_id = ? AND b.asiento IN (${placeholders})
         AND b.estado IN ('pagado','reservado')
         AND o.estado IN ('confirmada','reservado')`,
      [evento_id, ...asientos]
    );

    if (asientosOcupados.length > 0) {
      const labels = asientosOcupados.map(a => a.asiento).join(', ');
      return res.status(400).json({
        mensaje: `Los asientos ${labels} ya fueron reservados. Por favor elige otros.`
      });
    }

    const [ordenResult] = await pool.query(
      `INSERT INTO ordenes (usuario_id, evento_id, total, estado, fecha_orden)
        VALUES (?, ?, ?, 'pendiente', NOW())`,
      [usuario_id, evento_id, total]
    );
    const nuevaOrdenId = ordenResult.insertId;

    for (const asiento of asientos) {
      await pool.query(
        `INSERT INTO boletos (orden_id, evento_id, asiento, precio_final, estado, codigo_qr)
         VALUES (?, ?, ?, ?, 'reservado', ?)`,
        [nuevaOrdenId, evento_id, asiento, total / asientos.length, `QR-${nuevaOrdenId}-${asiento}`]
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'mxn',
      receipt_email: email_usuario,
      metadata: { orden_id: String(nuevaOrdenId), evento_id }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orden_id: nuevaOrdenId,
    });

  } catch (err) {
    console.error('Error en crear-intent:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

router.post('/confirmar', async (req, res) => {
  const { payment_intent_id, orden_id, email_usuario, nombre_usuario } = req.body;

  try {
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (intent.status !== 'succeeded') {
      await pool.query(`UPDATE ordenes SET estado = 'cancelada' WHERE id = ?`, [orden_id]);
      await pool.query(`UPDATE boletos SET estado = 'cancelado' WHERE orden_id = ?`, [orden_id]);
      return res.status(400).json({ mensaje: 'El pago no fue completado' });
    }

    await pool.query(`UPDATE ordenes SET estado = 'confirmada' WHERE id = ?`, [orden_id]);
    await pool.query(`UPDATE boletos SET estado = 'pagado' WHERE orden_id = ?`, [orden_id]);

    await pool.query(
      `INSERT IGNORE INTO pagos (orden_id, metodo, estado, referencia)
       VALUES (?, 'stripe', 'aprobado', ?)`,
      [orden_id, payment_intent_id]
    );

    const [boletos] = await pool.query(
      `SELECT b.asiento, b.codigo_qr, b.precio_final, e.titulo, e.fecha, e.ubicacion
       FROM boletos b
       JOIN eventos e ON b.evento_id = e.id
       WHERE b.orden_id = ?`,
      [orden_id]
    );

    if (email_usuario && boletos.length > 0) {
      const evento = boletos[0];
      const fechaEvento = new Date(evento.fecha).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const asientosHtml = boletos.map(b =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${b.asiento}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;">${b.codigo_qr}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">$${Number(b.precio_final).toLocaleString()}</td>
        </tr>`
      ).join('');

      await sendEmail(email_usuario, `✅ Confirmación de compra — ${evento.titulo}`, `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#000;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">TICKETX</h1>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="color:#111;">¡Compra exitosa, ${nombre_usuario || 'usuario'}!</h2>
            <p style="color:#555;">Tu compra ha sido procesada correctamente.</p>
            <div style="background:#f9f9f9;border:1px solid #eee;padding:16px;border-radius:8px;margin:24px 0;">
              <p style="margin:0 0 8px;"><strong>Evento:</strong> ${evento.titulo}</p>
              <p style="margin:0 0 8px;"><strong>Fecha:</strong> ${fechaEvento}</p>
              <p style="margin:0;"><strong>Lugar:</strong> ${evento.ubicacion}</p>
            </div>
            <h3 style="color:#111;">Tus asientos</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:8px 12px;text-align:left;">Asiento</th>
                  <th style="padding:8px 12px;text-align:left;">Código QR</th>
                  <th style="padding:8px 12px;text-align:left;">Precio</th>
                </tr>
              </thead>
              <tbody>${asientosHtml}</tbody>
            </table>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;text-align:center;color:#999;font-size:12px;">
              Presenta el código QR en la entrada del evento. TicketX © 2026
            </div>
          </div>
        </div>
      `);
    }

    res.json({ mensaje: 'Pago confirmado exitosamente', boletos });

  } catch (error) {
    console.error('Error al confirmar:', error);
    res.status(500).json({ mensaje: 'Error al confirmar el pago' });
  }
});

router.post('/crear-suscripcion', async (req, res) => {
  const { usuario_id, email, nombre, plan } = req.body;
  const precios = { monthly: 19900, annual: 199000 };

  if (!precios[plan]) return res.status(400).json({ mensaje: 'Plan no válido' });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: precios[plan],
      currency: 'mxn',
      metadata: { tipo: 'suscripcion', usuario_id: String(usuario_id), plan, email },
    });
    res.json({ clientSecret: paymentIntent.client_secret, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar la suscripción' });
  }
});

router.post('/confirmar-suscripcion', async (req, res) => {
  const { payment_intent_id, usuario_id, email, nombre, plan } = req.body;
  try {
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (intent.status !== 'succeeded') return res.status(400).json({ mensaje: 'El pago no completado' });

    await pool.query(`UPDATE usuarios SET tipo = 'Premium' WHERE id = ?`, [usuario_id]);
    res.json({ mensaje: 'Suscripción activada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al activar la suscripción' });
  }
});

router.get('/usuarios/:id/boletos', async (req, res) => {
    const usuarioId = req.params.id;

    try {
        const query = `
            SELECT 
                o.id as orden_id, o.fecha_orden, o.total, o.estado as orden_estado,
                e.id as evento_id, e.titulo, e.fecha as evento_fecha, e.ubicacion, e.imagen,
                b.asiento, b.codigo_qr, b.estado 
            FROM ordenes o
            JOIN boletos b ON o.id = b.orden_id
            JOIN eventos e ON b.evento_id = e.id
            WHERE o.usuario_id = ? 
        `;
        
        const [rows] = await pool.query(query, [usuarioId]);

        const ticketsAgrupados = rows.reduce((acc, row) => {
            const dateObj = new Date(row.evento_fecha);
            
            if (!acc[row.orden_id]) {
                acc[row.orden_id] = {
                    id: `ORD-${row.orden_id}`,
                    eventId: row.evento_id.toString(),
                    eventTitle: row.titulo,
                    eventDate: dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
                    eventTime: dateObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
                    eventVenue: row.ubicacion,
                    eventLocation: row.ubicacion,
                    eventImage: row.imagen,
                    seats: [],
                    purchaseDate: new Date(row.fecha_orden).toLocaleDateString("es-ES"),
                    totalPrice: `$${row.total}`,
                    qrCode: row.codigo_qr,
                    estado: row.orden_estado === 'cancelada' ? 'cancelado' : row.estado 
                };
            }
            if (row.asiento) {
                acc[row.orden_id].seats.push(row.asiento);
            }
            return acc;
        }, {});

        res.json(Object.values(ticketsAgrupados));
    } catch (error) {
        console.error("Error obteniendo boletos:", error);
        res.status(500).json({ mensaje: "Error al obtener boletos" });
    }
});

router.post('/retomar-intent', async (req, res) => {
  const { orden_id } = req.body;
  if (!orden_id) return res.status(400).json({ mensaje: 'Falta el ID de la orden' });

  try {
    const [[orden]] = await pool.query('SELECT total, usuario_id FROM ordenes WHERE id = ?', [orden_id]);
    if (!orden) return res.status(404).json({ mensaje: 'Orden no encontrada' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(orden.total * 100),
      currency: 'mxn',
      metadata: { orden_id: String(orden_id), tipo: 'retomar_reserva' },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar el pago pendiente' });
  }
});

router.post('/cancelar', async (req, res) => {
  const { ticket_id, asientos, evento_id } = req.body;
  console.log("Iniciando cancelación:", { ticket_id, asientos, evento_id });

  if (!ticket_id || !asientos || !evento_id) {
    return res.status(400).json({ mensaje: 'Faltan datos para la cancelación' });
  }

  const orden_id = ticket_id.replace('ORD-', '');

  try {
    console.log("Paso 1: Buscando orden...");
    const [[orden]] = await pool.query('SELECT estado, total FROM ordenes WHERE id = ?', [orden_id]);
    if (!orden) return res.status(404).json({ mensaje: 'Orden no encontrada' });

    console.log("Paso 2: Buscando llave del evento...");
    const [[evento]] = await pool.query('SELECT seatsio_event_key FROM eventos WHERE id = ?', [evento_id]);
    const seatsioEventKey = evento?.seatsio_event_key || String(evento_id);

    console.log("Paso 3: Liberando asientos en Seats.io para el evento:", seatsioEventKey);
    const client = new SeatsioClient(Region.NA(), process.env.SEATSIO_SECRET_KEY);
    await client.events.release(seatsioEventKey, asientos);

    if (orden.estado === 'confirmada') {
      console.log("Paso 4: Procesando reembolso en Stripe...");
      const [[pago]] = await pool.query(
        'SELECT referencia FROM pagos WHERE orden_id = ? AND estado = "aprobado"',
        [orden_id]
      );
      
      if (pago && pago.referencia) {
        await stripe.refunds.create({ payment_intent: pago.referencia });
        await pool.query(
          `UPDATE pagos SET estado = 'reembolsado' WHERE orden_id = ? AND referencia = ?`, 
          [orden_id, pago.referencia]
        );
      }
    }

    console.log("Paso 5: Cancelando en base de datos...");
    await pool.query(`UPDATE ordenes SET estado = 'cancelada' WHERE id = ?`, [orden_id]);
    await pool.query(`UPDATE boletos SET estado = 'cancelado' WHERE orden_id = ?`, [orden_id]);

    console.log("¡Cancelación exitosa!");
    res.json({ mensaje: 'Orden cancelada, reembolso emitido y asientos liberados exitosamente' });

  } catch (error) {
    console.error('❌ ERROR GRAVE EN EL BACKEND:', error);
    res.status(500).json({ mensaje: 'Error interno: ' + (error.message || 'Error desconocido') });
  }
});

router.get('/contador/resumen', async (req, res) => {
  try {
    const [[totales]] = await pool.query(`
      SELECT 
        COUNT(DISTINCT o.id)        AS total_ordenes,
        SUM(b.precio_final)         AS total_recaudado,
        SUM(b.precio_final) * 0.90  AS total_organizadores,
        SUM(b.precio_final) * 0.10  AS total_comisiones
      FROM boletos b
      JOIN ordenes o ON b.orden_id = o.id
      WHERE b.estado = 'pagado'
    `);

    const [[suscripciones]] = await pool.query(`
      SELECT COUNT(*) AS total_premium
      FROM usuarios WHERE tipo = 'Premium'
    `);

    res.json({ ...totales, total_premium: suscripciones.total_premium });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener resumen' });
  }
});

router.get('/contador/por-evento', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id              AS evento_id,
        e.titulo          AS evento,
        e.fecha,
        e.ubicacion,
        org.nombre        AS organizador,
        org.negocio,
        org.email         AS email_organizador,
        COUNT(b.id)                    AS boletos_vendidos,
        SUM(b.precio_final)            AS total_recaudado,
        SUM(b.precio_final) * 0.90     AS pago_organizador,
        SUM(b.precio_final) * 0.10     AS comision_ticketx,
        MAX(p.created_at)              AS ultimo_pago
      FROM boletos b
      JOIN eventos e   ON b.evento_id      = e.id
      JOIN organizadores org ON e.organizador_id = org.id
      LEFT JOIN ordenes o ON b.orden_id = o.id
      LEFT JOIN pagos p   ON o.id       = p.orden_id
      WHERE b.estado = 'pagado'
      GROUP BY e.id, e.titulo, e.fecha, e.ubicacion,
               org.nombre, org.negocio, org.email
      ORDER BY total_recaudado DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener desglose' });
  }
});

router.get('/contador/historial', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id            AS pago_id,
        p.referencia,
        p.metodo,
        p.estado        AS estado_pago,
        p.created_at    AS fecha_pago,
        o.total,
        u.nombre        AS usuario,
        u.email         AS email_usuario,
        e.titulo        AS evento,
        org.nombre      AS organizador
      FROM pagos p
      JOIN ordenes  o   ON p.orden_id      = o.id
      JOIN usuarios u   ON o.usuario_id    = u.id
      JOIN boletos  b   ON b.orden_id      = o.id
      JOIN eventos  e   ON b.evento_id     = e.id
      JOIN organizadores org ON e.organizador_id = org.id
      WHERE p.estado = 'aprobado'
      GROUP BY p.id, p.referencia, p.metodo, p.estado,
               p.created_at, o.total, u.nombre, u.email,
               e.titulo, org.nombre
      ORDER BY p.created_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener historial' });
  }
});

router.get('/reporte', async (req, res) => {
  try {
    const [reporte] = await pool.query(`
      SELECT 
        e.titulo AS evento,
        e.organizador_id,
        org.nombre AS organizador,
        org.negocio,
        COUNT(b.id) AS boletos_vendidos,
        SUM(b.precio_final) AS total_recaudado,
        SUM(b.precio_final) * 0.90 AS pago_organizador,
        SUM(b.precio_final) * 0.10 AS comision_ticketx
      FROM boletos b
      JOIN eventos e ON b.evento_id = e.id
      JOIN organizadores org ON e.organizador_id = org.id
      WHERE b.estado = 'pagado'
      GROUP BY e.id, e.titulo, e.organizador_id, org.nombre, org.negocio
      ORDER BY total_recaudado DESC
    `);
    res.json(reporte);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar reporte' });
  }
});

router.get('/stripe-balance', async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json(balance);
  } catch (error) {
    console.error("Error obteniendo saldo de Stripe:", error);
    res.status(500).json({ mensaje: 'Error al conectar con Stripe' });
  }
});

router.post('/verificar', async (req, res) => {
  const { evento_id, asiento_label } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT b.asiento FROM boletos b
       JOIN ordenes o ON b.orden_id = o.id
       WHERE b.evento_id = ? AND b.asiento = ? 
         AND b.estado IN ('pagado', 'reservado')
         AND o.estado IN ('confirmada', 'reservado')
       LIMIT 1`,
      [evento_id, asiento_label]
    );

    if (rows.length === 0) {
      return res.json({ ocupado: false });
    }

    const seatsioRes = await fetch(
      `https://api.seatsio.net/reports/events/${evento_id}/byLabel/${asiento_label}`,
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(process.env.SEATSIO_SECRET_KEY + ':').toString('base64')
        }
      }
    );

    const seatsioData = await seatsioRes.json();
    const statusEnSeatsio = seatsioData[asiento_label]?.[0]?.status;

    if (statusEnSeatsio === 'free') {
      await pool.query(
        `UPDATE boletos SET estado = 'cancelado' 
         WHERE evento_id = ? AND asiento = ? AND estado = 'reservado'`,
        [evento_id, asiento_label]
      );
      return res.json({ ocupado: false, sincronizado: true });
    }

    return res.json({ ocupado: true });

  } catch (err) {
    console.error('Error verificando asiento:', err);
    res.status(500).json({ error: 'Error al verificar asiento' });
  }
});

module.exports = router;