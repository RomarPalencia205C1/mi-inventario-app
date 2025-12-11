// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const productosRoutes = require('./routes/productos.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Archivos estáticos (Frontend)
// Nota: 'public' ahora está un nivel arriba de 'src', por eso usamos path.join con '..'
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
// Todas las rutas de productos empezarán con /api/productos para ser más ordenados
app.use('/api/productos', productosRoutes);

// ✅ OPCIÓN A (CORREGIDO)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;