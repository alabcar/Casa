/* Modelo de cálculo: compra de la casa de Foios y venta del piso.
   Funciones puras, sin DOM. Importes en euros. */
function pmt(capital, tipoAnual, anios) {
  if (!(capital > 0)) return 0;
  var i = tipoAnual / 100 / 12;
  var n = anios * 12;
  if (i === 0) return capital / n;
  return (capital * i) / (1 - Math.pow(1 + i, -n));
}

/* IRPF base del ahorro (escala estatal + autonómica vigente: 19-21-23-27-30 %). */
function irpfAhorro(ganancia) {
  if (!(ganancia > 0)) return 0;
  var tramos = [
    [6000, 0.19],
    [44000, 0.21],
    [150000, 0.23],
    [100000, 0.27],
    [Infinity, 0.3]
  ];
  var resto = ganancia;
  var total = 0;
  for (var k = 0; k < tramos.length && resto > 0; k++) {
    var parte = Math.min(resto, tramos[k][0]);
    total += parte * tramos[k][1];
    resto -= parte;
  }
  return total;
}

var DEFAULTS = {
  precio: 400000,
  obras: 50000,
  obrasAntes: 30000,
  venta: 370000,
  ahorros: 100000,
  padres: 100000,
  hipoteca: 'muface',
  tipo: 2.6,
  plazo: 30,
  honorariosCompra: 1.5,
  honorariosVenta: 2.5,
  iva: 21,
  itp: 9,
  gastosCompra: 2800,
  otrosVenta: 4100,
  pendiente: 56000,
  cuotaActual: 350,
  ahorrosTotales: 145000,
  colchonMin: 30000,
  ingresos: 5833,
  titularidad: 75,
  valorAdquisicion: 250000,
  ltv: 80,
  tasacion: 0,
  amortPct: 100,
  repartoHip: 50,
  m2: 285,
  mediana: 1394
};

function calcular(p) {
  var r = {};
  var iva = 1 + p.iva / 100;

  /* Compra */
  r.itp = p.precio * (p.itp / 100);
  r.honorariosCompra = p.precio * (p.honorariosCompra / 100) * iva;
  r.totalCompra = p.precio + r.itp + r.honorariosCompra + p.gastosCompra;
  r.obrasAntes = Math.min(p.obrasAntes, p.obras);
  r.obrasDespues = p.obras - r.obrasAntes;
  r.pagarAhora = r.totalCompra + r.obrasAntes;
  r.disponible = p.ahorros + p.padres;
  r.baseTasacion = p.tasacion > 0 ? Math.min(p.precio, p.tasacion) : p.precio;
  r.maxHipoteca = r.baseTasacion * (p.ltv / 100);
  var falta = r.pagarAhora - r.disponible;
  r.hipotecaAlComprar = Math.max(0, Math.min(falta, r.maxHipoteca));
  r.faltaEntrada = Math.max(0, falta - r.maxHipoteca);
  r.sobraPrestamo = Math.max(0, -falta);
  r.tasacionMinima = r.hipotecaAlComprar / (p.ltv / 100);
  r.precioM2 = p.m2 > 0 ? p.precio / p.m2 : 0;
  r.liquidoTrasCompra = p.ahorrosTotales - p.ahorros - r.faltaEntrada + r.sobraPrestamo;

  /* Venta del piso */
  r.honorariosVenta = p.venta * (p.honorariosVenta / 100) * iva;
  r.netoVenta = p.venta - p.pendiente - r.honorariosVenta - p.otrosVenta;
  r.caja = r.netoVenta - p.padres - r.obrasDespues;
  r.amortizacion = Math.max(0, Math.min(r.caja, r.hipotecaAlComprar)) * (p.amortPct / 100);
  r.hipotecaFinal = r.hipotecaAlComprar - r.amortizacion;
  r.sobraTrasVender = Math.max(0, r.caja - r.hipotecaAlComprar);
  r.faltaTrasVender = Math.max(0, -r.caja);
  r.liquidoFinal = r.liquidoTrasCompra + (r.caja - r.amortizacion);

  /* Aportaciones (hipoteca final repartida según repartoHip % de Julia) */
  r.aportTu = (r.pagarAhora - r.hipotecaAlComprar) + r.obrasDespues + r.amortizacion;
  r.aportTotal = r.totalCompra + p.obras;
  r.aportTuPct = r.aportTotal > 0 ? (r.aportTu + r.hipotecaFinal * (1 - p.repartoHip / 100)) / r.aportTotal : 0;

  /* Cuotas */
  r.cuotaAlComprar = pmt(r.hipotecaAlComprar, p.tipo, p.plazo);
  r.cuotaMientrasVendeis = r.cuotaAlComprar + p.cuotaActual;
  r.cuotaFinal = pmt(r.hipotecaFinal, p.tipo, p.plazo);

  /* Comisión por amortizar */
  if (p.hipoteca === 'muface') {
    r.comisionTope = 0;
  } else {
    var libre = p.hipoteca === 'otro' ? 0 : 0.25 * r.hipotecaAlComprar;
    r.comisionTope = 0.02 * Math.max(0, r.amortizacion - libre);
  }

  /* Hacienda */
  r.importeObtenido = r.netoVenta; /* venta - hipoteca pendiente - gastos de venta (confirmar con gestor) */
  r.parteTuya = r.totalCompra * (p.titularidad / 100);
  r.titularidadMinima = r.totalCompra > 0 ? r.importeObtenido / r.totalCompra : 0;
  r.ventaMaxCubierta = (r.parteTuya + p.pendiente + p.otrosVenta) / (1 - (p.honorariosVenta / 100) * iva);
  r.reinvierteTodo = r.parteTuya >= r.importeObtenido;
  r.sinReinvertir = Math.max(0, r.importeObtenido - r.parteTuya);
  r.plusvalia = p.venta - r.honorariosVenta - p.otrosVenta - p.valorAdquisicion;
  r.irpfSinExencion = irpfAhorro(r.plusvalia);

  /* Ratios */
  r.ratioMientrasVendeis = p.ingresos > 0 ? r.cuotaMientrasVendeis / p.ingresos : 0;
  r.ratioFinal = p.ingresos > 0 ? r.cuotaFinal / p.ingresos : 0;
  r.honorariosTotales = r.honorariosCompra + r.honorariosVenta;
  return r;
}

if (typeof module !== 'undefined') {
  module.exports = { pmt: pmt, irpfAhorro: irpfAhorro, calcular: calcular, DEFAULTS: DEFAULTS };
}
