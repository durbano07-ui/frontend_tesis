// Lista cerrada de vías de administración (igual a ProductoFarmacia::VIAS_ADMINISTRACION del backend).
// Se elige de la lista para evitar textos mal escritos en recetas e inventario.
export const VIAS_ADMINISTRACION = [
    'Oral', 'Sublingual', 'Tópica', 'Oftálmica', 'Ótica', 'Nasal', 'Inhalatoria', 'Rectal',
    'Vaginal', 'Intramuscular', 'Intravenosa', 'Subcutánea', 'Intradérmica', 'Transdérmica',
];

export const VIA_POR_DEFECTO = 'Oral';

/** Vía registrada por Farmacia para el producto, o null si no tiene (o no es válida). */
export const viaDeProducto = (producto) =>
    VIAS_ADMINISTRACION.includes(producto?.via_administracion) ? producto.via_administracion : null;
