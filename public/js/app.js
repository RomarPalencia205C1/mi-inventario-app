// public/js/app.js
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto as borrarApi } from './api.js';

// Estado global de la aplicación
let estado = {
    paginaActual: 1,
    idEditando: null
};

// --- FUNCIONES PRINCIPALES ---

async function cargarProductos(resetearPagina = false) {
    if (resetearPagina) estado.paginaActual = 1;

    const termino = document.getElementById('inputBusqueda').value;
    const orden = document.getElementById('selectOrden').value;

    try {
        const resultado = await obtenerProductos(estado.paginaActual, termino, orden);
        renderizarLista(resultado);
        renderizarPaginacion(resultado);
    } catch (error) {
        console.error(error);
        document.getElementById('listaProductos').innerHTML = 
            '<p class="cargando text-red-500">Error al conectar con el servidor</p>';
    }
}

async function gestionarProducto() {
    const nombre = document.getElementById('inputNombre').value;
    const precio = document.getElementById('inputPrecio').value;

    // Validaciones básicas
    if (!nombre.trim()) return alert("El nombre es obligatorio");
    if (!precio || parseFloat(precio) <= 0) return alert("El precio debe ser mayor a 0");

    try {
        if (estado.idEditando === null) {
            await crearProducto(nombre, precio);
        } else {
            await actualizarProducto(estado.idEditando, nombre, precio);
            // Resetear modo edición
            estado.idEditando = null;
            resetearFormulario();
        }

        // Limpiar inputs y recargar
        document.getElementById('inputNombre').value = '';
        document.getElementById('inputPrecio').value = '';
        cargarProductos();

    } catch (error) {
        alert("⚠️ " + error.message);
    }
}

async function eliminarItem(id) {
    if(!confirm('¿Estás seguro de borrar este producto?')) return;
    try {
        await borrarApi(id);
        cargarProductos();
    } catch (error) {
        alert("No se pudo eliminar: " + error.message);
    }
}

// --- FUNCIONES DE RENDERIZADO (UI) ---

function renderizarLista(resultado) {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = '';

    if (resultado.datos.length === 0) {
        lista.innerHTML = `
            <div class="cargando">
                <span class="text-2xl mb-2">🤷‍♂️</span><p>No hay resultados</p>
            </div>`;
        return;
    }

    resultado.datos.forEach(producto => {
        const item = `
            <li class="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md">
                <div class="flex-1">
                    <div class="font-bold text-slate-700">${producto.nombre}</div>
                    <div class="text-green-600 font-bold text-sm">$${producto.precio}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick="prepararEdicion('${producto.nombre}', '${producto.precio}', ${producto.id})" 
                        class="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded shadow-sm" title="Editar">✏️</button>
                    <button onclick="eliminarItem(${producto.id})" 
                        class="bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow-sm" title="Eliminar">🗑️</button>
                </div>
            </li>`;
        lista.innerHTML += item;
    });
}

function renderizarPaginacion(resultado) {
    document.getElementById('indicadorPagina').innerText = `Página ${resultado.paginaActual} de ${resultado.totalPaginas || 1}`;
    document.getElementById('totalLabel').innerText = `${resultado.totalProductos} registros`;
    
    document.getElementById('btnPrev').disabled = (resultado.paginaActual === 1);
    document.getElementById('btnNext').disabled = (resultado.paginaActual >= resultado.totalPaginas);
}

// --- AUXILIARES ---

function cambiarPagina(dir) {
    estado.paginaActual += dir;
    cargarProductos();
}

function prepararEdicion(nombre, precio, id) {
    document.getElementById('inputNombre').value = nombre;
    document.getElementById('inputPrecio').value = precio;
    estado.idEditando = id;
    
    const btn = document.getElementById('btnAccion');
    btn.innerText = "Actualizar Producto";
    btn.className = "w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded shadow transition transform active:scale-95";
}

function resetearFormulario() {
    const btn = document.getElementById('btnAccion');
    btn.innerText = "Guardar Producto";
    btn.className = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow transition transform active:scale-95";
}

// --- EXPOSICIÓN GLOBAL ---
// Esto es necesario porque el HTML usa onclick="cargarProductos()"
window.cargarProductos = cargarProductos;
window.gestionarProducto = gestionarProducto;
window.eliminarItem = eliminarItem;
window.cambiarPagina = cambiarPagina;
window.prepararEdicion = prepararEdicion;

// Iniciar
cargarProductos();