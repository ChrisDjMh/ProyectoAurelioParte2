const cron = require('node-cron');
const fetch = require('node-fetch');

const auth = 'Basic ' + Buffer.from(process.env.SEATSIO_SECRET_KEY + ':').toString('base64');

cron.schedule('* * * * *', async () => {
  try {
    const expiradas = await Orden.findAll({
      where: {
        estado: 'reservado',
        expira_en: { [Op.lt]: new Date() }
      }
    });

    for (const orden of expiradas) {
      const asientos = JSON.parse(orden.asientos);

      await fetch(
        `https://api.seatsio.net/events/${orden.evento_id}/actions/release`,
        {
          method: 'POST',
          headers: { Authorization: auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ objects: asientos, holdToken: orden.hold_token })
        }
      );

      await orden.update({ estado: 'expirada' });

      console.log(`Orden ${orden.id} expirada. Asientos liberados: ${asientos.join(', ')}`);
    }
  } catch (err) {
    console.error('Error en limpieza de reservas:', err);
  }
});