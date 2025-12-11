// src/routes/productos.routes.js
const { Router } = require('express');
const router = Router();
const { 
    obtenerProductos, 
    crearProducto, 
    actualizarProducto, 
    eliminarProducto 
} = require('../controllers/productos.controller');

// Definimos las rutas
router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;