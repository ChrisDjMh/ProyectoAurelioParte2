const express = require('express');
const cors = require('cors');
require('dotenv').config();



const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('./db');

const app = express();
const webhookRouter = require('./webhook.js');

app.use(cors()); 
app.use('/api', webhookRouter);
app.use(express.json()); 

const eventosRoutes = require('./routes/eventos');
app.use('/api/validacion', require('./routes/validacion'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pagos', require('./routes/pagos'));

app.use('/api/eventos', eventosRoutes);

app.get('/', (req, res) => {
    res.send('¡El servidor de Ticketx está funcionando correctamente! 🚀');
});

setInterval(async () => {
  try {
    await pool.query(`
      UPDATE boletos b
      JOIN ordenes o ON b.orden_id = o.id
      SET b.estado = 'cancelado', o.estado = 'cancelada'
      WHERE b.estado = 'reservado'
      AND o.estado = 'pendiente'
      AND o.created_at < NOW() - INTERVAL 30 MINUTE
    `);
    console.log('🧹 Reservas expiradas limpiadas');
  } catch (err) {
    console.error('Error limpiando reservas:', err);
  }
}, 5 * 60 * 1000);

app.post('/api/pagos/premium/crear-intent', async (req, res) => {
    const { usuario_id, total, email_usuario } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total * 100,
            currency: 'mxn',
            receipt_email: email_usuario,
            metadata: { 
                tipo_pago: 'premium_vitalicio',
                usuario_id: usuario_id 
            }
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});


app.post('/api/usuarios/upgrade-premium', async (req, res) => {
    const { payment_intent_id, usuario_id } = req.body;
    
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ mensaje: "El pago no está confirmado por Stripe." });
        }

        const query = `UPDATE usuarios SET tipo = 'Premium' WHERE id = ?`;
        await pool.query(query, [usuario_id]);

        res.json({ mensaje: "Usuario actualizado a Premium exitosamente" });

    } catch (error) {
        console.error("🚨 Error al actualizar a Premium:", error);
        res.status(500).json({ mensaje: "Error interno del servidor", detalle: error.message });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});