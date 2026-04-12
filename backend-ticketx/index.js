const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('./db');

const app = express();

// Middlewares
app.use(cors()); // Esencial para conectar con React
app.use(express.json()); // Permite recibir datos en formato JSON (ej. para el LoginRegisterModal)

// Importar rutas
const eventosRoutes = require('./routes/eventos');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pagos', require('./routes/pagos'));

// Usar rutas
app.use('/api/eventos', eventosRoutes);

app.get('/', (req, res) => {
    res.send('¡El servidor de Ticketx está funcionando correctamente! 🚀');
});


app.post('/api/pagos/premium/crear-intent', async (req, res) => {
    const { usuario_id, total, email_usuario } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total * 100, // Stripe usa centavos
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
        // 1. Verificar con Stripe que el pago fue exitoso
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ mensaje: "El pago no está confirmado por Stripe." });
        }

        // 2. Actualizar la base de datos (usando 'pool' y 'await')
        const query = `UPDATE usuarios SET tipo = 'Premium' WHERE id = ?`;
        await pool.query(query, [usuario_id]);

        // 3. Responder con JSON válido
        res.json({ mensaje: "Usuario actualizado a Premium exitosamente" });

    } catch (error) {
        console.error("🚨 Error al actualizar a Premium:", error);
        // Enviamos el error como JSON para que React no falle leyendo HTML
        res.status(500).json({ mensaje: "Error interno del servidor", detalle: error.message });
    }
});


// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    // Al agregar http://localhost:, la terminal lo volverá un enlace clickeable
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
});