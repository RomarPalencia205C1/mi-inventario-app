// src/controllers/productos.controller.js
const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
    try {
        const { busqueda, orden } = req.query;
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = 10;
        const offset = (pagina - 1) * limite;

        let clausulaOrden = 'ORDER BY id ASC';
        if (orden === 'az') clausulaOrden = 'ORDER BY nombre ASC';
        else if (orden === 'za') clausulaOrden = 'ORDER BY nombre DESC';
        else if (orden === 'precio_menor') clausulaOrden = 'ORDER BY precio ASC';
        else if (orden === 'precio_mayor') clausulaOrden = 'ORDER BY precio DESC';

        let queryData, queryCount, params;

        if (busqueda) {
            queryData = `SELECT * FROM productos WHERE nombre ILIKE $1 ${clausulaOrden} LIMIT $2 OFFSET $3`;
            queryCount = 'SELECT COUNT(*) FROM productos WHERE nombre ILIKE $1';
            params = [`%${busqueda}%`, limite, offset];
        } else {
            queryData = `SELECT * FROM productos ${clausulaOrden} LIMIT $1 OFFSET $2`;
            queryCount = 'SELECT COUNT(*) FROM productos';
            params = [limite, offset];
        }

        const resultadoData = await pool.query(queryData, params);
        const paramsCount = busqueda ? [`%${busqueda}%`] : [];
        const resultadoCount = await pool.query(queryCount, paramsCount);

        const totalProductos = parseInt(resultadoCount.rows[0].count);
        const totalPaginas = Math.ceil(totalProductos / limite);

        res.json({
            datos: resultadoData.rows,
            paginaActual: pagina,
            totalPaginas,
            totalProductos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, precio } = req.body;
    
    // Validaciones
    if (!nombre || nombre.trim() === "") return res.status(400).json({ error: "Nombre vacío" });
    if (!precio || precio <= 0) return res.status(400).json({ error: "Precio inválido" });

    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, precio) VALUES ($1, $2) RETURNING *',
            [nombre, precio]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar' });
    }
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;

    if (!nombre || nombre.trim() === "") return res.status(400).json({ error: "Nombre vacío" });
    if (!precio || precio <= 0) return res.status(400).json({ error: "Precio inválido" });

    try {
        const result = await pool.query(
            'UPDATE productos SET nombre = $1, precio = $2 WHERE id = $3',
            [nombre, precio, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: 'No encontrado' });
        res.json({ message: 'Actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ message: 'Eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
};

// Exportamos las funciones para usarlas en las rutas
module.exports = {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};