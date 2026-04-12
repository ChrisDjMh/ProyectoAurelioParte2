const express = require('express');
const router = express.Router();
const pool = require('../db');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Configurar nodemailer ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Helper: enviar email ──────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// POST /api/pagos/crear-intent — Pago de asientos
// Body: { evento_id, usuario_id, asientos[], total, email_usuario }
// ─────────────────────────────────────────────────────────────────
router.post('/crear-intent', async (req, res) => {
  const { evento_id, usuario_id, asientos, total, email_usuario } = req.body;

  if (!evento_id || !usuario_id || !asientos?.length || !total) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  try {
    // Verificar que los asientos no estén ya ocupados (doble check)
    const placeholders = asientos.map(() => '?').join(',');
    const [ocupados] = await pool.query(
      `SELECT asiento FROM boletos 
       WHERE evento_id = ? AND asiento IN (${placeholders}) 
       AND estado IN ('pagado','reservado')`,
      [evento_id, ...asientos]
    );

    if (ocupados.length > 0) {
      const names = ocupados.map(r => r.asiento).join(', ');
      return res.status(409).json({
        mensaje: `Los asientos ${names} ya fueron reservados. Por favor elige otros.`
      });
    }

    // Obtener info del evento
    const [[evento]] = await pool.query(
      'SELECT titulo, organizador_id FROM eventos WHERE id = ?',
      [evento_id]
    );

    // Crear PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe usa centavos
      currency: 'mxn',
      metadata: {
        evento_id: String(evento_id),
        usuario_id: String(usuario_id),
        asientos: asientos.join(','),
        email_usuario: email_usuario || '',
        titulo_evento: evento.titulo,
      },
    });

    // Crear orden en BD con estado pendiente
    const [ordenResult] = await pool.query(
      `INSERT INTO ordenes (usuario_id, total, estado) VALUES (?, ?, 'pendiente')`,
      [usuario_id, total]
    );
    const orden_id = ordenResult.insertId;

    // Crear boletos con estado 'reservado' para bloquear los asientos temporalmente
    for (const asiento of asientos) {
      const codigoQr = `TKT-${evento_id}-${asiento}-${Date.now()}`;
      await pool.query(
        `INSERT INTO boletos (orden_id, evento_id, asiento, codigo_qr, precio_final, estado)
         VALUES (?, ?, ?, ?, ?, 'reservado')`,
        [orden_id, evento_id, asiento, codigoQr, total / asientos.length]
      );
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      orden_id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });

  } catch (error) {
    console.error('Error al crear intent:', error);
    res.status(500).json({ mensaje: 'Error al procesar el pago' });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/pagos/confirmar — Llamado tras pago exitoso en frontend
// Body: { payment_intent_id, orden_id, email_usuario, nombre_usuario }
// ─────────────────────────────────────────────────────────────────
router.post('/confirmar', async (req, res) => {
  const { payment_intent_id, orden_id, email_usuario, nombre_usuario } = req.body;

  try {
    // Verificar con Stripe que el pago realmente se completó
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (intent.status !== 'succeeded') {
      // Pago falló — cancelar orden y liberar asientos
      await pool.query(
        `UPDATE ordenes SET estado = 'cancelada' WHERE id = ?`, [orden_id]
      );
      await pool.query(
        `UPDATE boletos SET estado = 'cancelado' WHERE orden_id = ?`, [orden_id]
      );
      return res.status(400).json({ mensaje: 'El pago no fue completado' });
    }

    // Pago exitoso — confirmar orden y boletos
    await pool.query(
      `UPDATE ordenes SET estado = 'confirmada' WHERE id = ?`, [orden_id]
    );
    await pool.query(
      `UPDATE boletos SET estado = 'pagado' WHERE orden_id = ?`, [orden_id]
    );

    // Guardar pago en tabla pagos
    await pool.query(
      `INSERT INTO pagos (orden_id, metodo, estado, referencia)
       VALUES (?, 'stripe', 'aprobado', ?)`,
      [orden_id, payment_intent_id]
    );

    // Obtener info de los boletos para el email
    const [boletos] = await pool.query(
      `SELECT b.asiento, b.codigo_qr, b.precio_final, e.titulo, e.fecha, e.ubicacion
       FROM boletos b
       JOIN eventos e ON b.evento_id = e.id
       WHERE b.orden_id = ?`,
      [orden_id]
    );

    // Enviar email de confirmación
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

// ─────────────────────────────────────────────────────────────────
// POST /api/pagos/crear-suscripcion — Premium
// Body: { usuario_id, email, nombre, plan ('monthly'|'annual') }
// ─────────────────────────────────────────────────────────────────
router.post('/crear-suscripcion', async (req, res) => {
  const { usuario_id, email, nombre, plan } = req.body;

  // Precios en centavos MXN
  const precios = {
    monthly: 19900,  // $199 MXN
    annual:  199000, // $1,990 MXN
  };

  if (!precios[plan]) {
    return res.status(400).json({ mensaje: 'Plan no válido' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: precios[plan],
      currency: 'mxn',
      metadata: {
        tipo: 'suscripcion',
        usuario_id: String(usuario_id),
        plan,
        email,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Error al crear suscripción:', error);
    res.status(500).json({ mensaje: 'Error al procesar la suscripción' });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/pagos/confirmar-suscripcion
// Body: { payment_intent_id, usuario_id, email, nombre, plan }
// ─────────────────────────────────────────────────────────────────
router.post('/confirmar-suscripcion', async (req, res) => {
  const { payment_intent_id, usuario_id, email, nombre, plan } = req.body;

  try {
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (intent.status !== 'succeeded') {
      return res.status(400).json({ mensaje: 'El pago de suscripción no fue completado' });
    }

    // Actualizar usuario a Premium en BD
    await pool.query(
      `UPDATE usuarios SET tipo = 'Premium' WHERE id = ?`,
      [usuario_id]
    );

    // Email de bienvenida Premium
    if (email) {
      await sendEmail(email, '👑 ¡Bienvenido a TicketX Premium!', `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">👑 TicketX Premium</h1>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="color:#111;">¡Felicidades, ${nombre}!</h2>
            <p style="color:#555;">Tu suscripción <strong>${plan === 'monthly' ? 'Mensual' : 'Anual'}</strong> ha sido activada.</p>
            <div style="background:#fffbeb;border:1px solid #fcd34d;padding:16px;border-radius:8px;margin:24px 0;">
              <p style="margin:0 0 8px;"><strong>✅ Acceso a asientos VIP</strong></p>
              <p style="margin:0 0 8px;"><strong>⚡ Compra prioritaria</strong></p>
              <p style="margin:0 0 8px;"><strong>⭐ Descuentos exclusivos</strong></p>
              <p style="margin:0;"><strong>✨ Sin comisiones</strong></p>
            </div>
            <p style="color:#999;font-size:12px;text-align:center;">TicketX © 2026</p>
          </div>
        </div>
      `);
    }

    res.json({ mensaje: 'Suscripción activada exitosamente' });

  } catch (error) {
    console.error('Error al confirmar suscripción:', error);
    res.status(500).json({ mensaje: 'Error al activar la suscripción' });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/pagos/reporte — Para el contador
// ─────────────────────────────────────────────────────────────────
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
    console.error(error);
    res.status(500).json({ mensaje: 'Error al generar reporte' });
  }
});

router.get('/usuarios/:id/boletos', async (req, res) => {
    const usuarioId = req.params.id;

    try {
        const query = `
            SELECT 
                o.id as orden_id, o.fecha_orden, o.total,
                e.id as evento_id, e.titulo, e.fecha as evento_fecha, e.ubicacion, e.imagen,
                b.asiento, b.codigo_qr
            FROM ordenes o
            JOIN boletos b ON o.id = b.orden_id
            JOIN eventos e ON b.evento_id = e.id
            WHERE o.usuario_id = ? AND o.estado = 'confirmada'
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
                    qrCode: row.codigo_qr
                };
            }
            acc[row.orden_id].seats.push(row.asiento);
            return acc;
        }, {});

        res.json(Object.values(ticketsAgrupados));
    } catch (error) {
        console.error("Error obteniendo boletos:", error);
        res.status(500).json({ mensaje: "Error al obtener boletos" });
    }
});

module.exports = router;