const rateLimit = require('express-rate-limit');

// Limitador de peticiones para proteger la API
const limitarPeticiones = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    mensaje: {
        exito: false,
        mensaje: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
    }
});

module.exports = limitarPeticiones;