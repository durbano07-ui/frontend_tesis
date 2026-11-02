/**
 * Stock de un producto de Farmacia para mostrar: total en unidades si se conocen las unidades por
 * caja; si no (productos anteriores al cambio), cajas y unidades sueltas por separado.
 */
export const textoStockFarmacia = (p) => (p?.unidades_por_caja
    ? `${p.stock_cajas * p.unidades_por_caja + p.stock_unidades} unidades`
    : `${p?.stock_cajas ?? 0} cj / ${p?.stock_unidades ?? 0} ud`);
