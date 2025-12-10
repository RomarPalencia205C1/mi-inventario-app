const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path'); // Nuevo: Para manejar rutas de archivos

const app = express();
// El puerto lo decide la nube (process.env.PORT) o usa 3000 si es local
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
// Nuevo: Servir los archivos de la carpeta "public" (tu HTML)
app.use(express.static('public'));

// Configuración de la Base de Datos (Adaptable a Nube y Local)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // La nube nos dará esta URL secreta
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // SSL necesario en la nube
});

// --- RUTAS ---

// RUTA 1: Obtener (GET)
app.get('/productos', async (req, res) => {
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
      totalPaginas: totalPaginas,
      totalProductos: totalProductos
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});

// RUTA 2: Crear (POST)
app.post('/productos', async (req, res) => {
    const { nombre, precio } = req.body;
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
        res.status(500).send('Error al guardar');
    }
});

// RUTA 3: Actualizar (PUT)
app.put('/productos/:id', async (req, res) => {
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
        res.status(500).send('Error al actualizar');
    }
});

// RUTA 4: Eliminar (DELETE)
app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ message: 'Eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json('Error al eliminar');
    }
});

// Nuevo: Cualquier otra ruta devuelve el HTML (para que la app cargue siempre)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});
