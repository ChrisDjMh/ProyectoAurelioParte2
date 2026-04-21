const express = require('express');
const Stripe = require('stripe');
const db = require('./db.js');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    // 1. Verificar firma de Stripe
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Firma inválida:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. Idempotencia
    try {
      const [existing] = await db.query(
        'SELECT id FROM stripe_webhook_events WHERE event_id = ?',
        [event.id]
      );
      if (existing.length > 0) {
        console.log('⚠️ Evento ya procesado:', event.id);
        return res.json({ received: true });
      }

      await db.query(
        `INSERT INTO stripe_webhook_events (event_id, event_type, procesado)
         VALUES (?, ?, 0)`,
        [event.id, event.type]
      );
    } catch (err) {
      console.error('❌ Error idempotencia:', err);
      return res.status(500).send('Error interno');
    }

    // 3. Manejar payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;

      try {
        // Buscar la orden por stripe_payment_intent_id
        const [ordenes] = await db.query(
          `SELECT id FROM ordenes 
           WHERE stripe_payment_intent_id = ? AND estado = 'pendiente'`,
          [intent.id]
        );

        if (ordenes.length === 0) {
          // La orden ya fue confirmada por el frontend — está bien, no es error
          console.log('ℹ️ Orden ya confirmada o no encontrada para intent:', intent.id);
          return res.json({ received: true });
        }

        const ordenId = ordenes[0].id;

        // Confirmar orden
        await db.query(
          `UPDATE ordenes SET estado = 'confirmada' WHERE id = ?`,
          [ordenId]
        );

        // Confirmar boletos
        await db.query(
          `UPDATE boletos SET estado = 'pagado'
           WHERE orden_id = ? AND estado = 'reservado'`,
          [ordenId]
        );

        // Registrar pago si no existe
        await db.query(
          `INSERT IGNORE INTO pagos (orden_id, metodo, estado, referencia, stripe_payment_intent_id, monto, moneda)
           VALUES (?, 'stripe', 'aprobado', ?, ?, ?, ?)`,
          [
            ordenId,
            intent.id,
            intent.id,
            intent.amount / 100,
            intent.currency,
          ]
        );

        // Marcar evento como procesado
        await db.query(
          `UPDATE stripe_webhook_events SET procesado = 1, orden_id = ?
           WHERE event_id = ?`,
          [ordenId, event.id]
        );

        console.log('✅ Webhook confirmó orden:', ordenId);
      } catch (err) {
        console.error('❌ Error procesando payment_intent.succeeded:', err);
        return res.status(500).send('Error procesando pago');
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;