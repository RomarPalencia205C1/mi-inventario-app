// public/js/api.js

const API_BASE_URL = '/api/productos';

// 1. Obtener productos (con filtros)
export async function obtenerProductos(pagina = 1, busqueda = '', orden = '') {
    let url = `${API_BASE_URL}?pagina=${pagina}&orden=${orden}`;
    if (busqueda) {
        url += `&busqueda=${encodeURIComponent(busqueda)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener productos');
    return await response.json();
}

// 2. Crear producto
export async function crearProducto(nombre, precio) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear');
    }
    return await response.json();
}

// 3. Actualizar producto
export async function actualizarProducto(id, nombre, precio) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar');
    }
    return await response.json();
}

// 4. Eliminar producto
export async function eliminarProducto(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar');
    return await response.json();
}