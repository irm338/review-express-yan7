require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET. Configúralo en el archivo .env antes de iniciar el servidor.');
}

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { exito: false, mensaje: 'Demasiadas peticiones. Intente más tarde.' }
}));

app.get('/api/health', (req, res) => {
    res.json({ exito: true, mensaje: 'API de biblioteca disponible.' });
});

app.use('/api/v1/auth', require('./routes/v1/authRoutes'));
app.use('/api/v1/libros', require('./routes/v1/libroRoutes'));
app.use('/api/v1/prestamos', require('./routes/v1/prestamoRoutes'));
app.use('/api/v1/ventas', require('./routes/v1/ventaRoutes'));

app.use((req, res) => {
    res.status(404).json({ exito: false, mensaje: 'Ruta no encontrada.' });
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ exito: false, mensaje: 'El cuerpo de la solicitud debe ser JSON válido.' });
    }
    console.error('Error inesperado en la API:', error);
    res.status(500).json({ exito: false, mensaje: 'Ocurrió un error interno.' });
});

if (require.main === module) {
    const puerto = Number(process.env.PORT) || 3000;
    const db = require('./config/db');

    db.query('SELECT 1')
        .then(() => {
            app.listen(puerto, () => {
                console.log(`Servidor de biblioteca disponible en http://localhost:${puerto}`);
            });
        })
        .catch((error) => {
            console.error('No se pudo conectar con MySQL. Verifique la base de datos y el archivo .env:', error.message);
            process.exitCode = 1;
        });
}

module.exports = app;
