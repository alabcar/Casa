const { calcular, DEFAULTS, pmt, irpfAhorro } = require('./model.js');
const base = Object.assign({}, DEFAULTS, { obrasAntes: 0 });
function caso(precio, obras, extra) {
  const r = calcular(Object.assign({}, base, { precio, obras }, extra || {}));
  return r;
}
const k = (x) => Math.round(x / 100) / 10;
const esperado = [
  [420000, 50000, 118.4, 475],
  [420000, 100000, 168.4, 675],
  [400000, 50000, 96.3, 385],
  [400000, 100000, 146.3, 585],
  [380000, 50000, 74.1, 300],
  [380000, 100000, 124.1, 495]
];
let ok = true;
for (const [pr, ob, finalK, cuota] of esperado) {
  const r = caso(pr, ob);
  const gotK = k(r.hipotecaFinal);
  const gotC = Math.round(r.cuotaFinal / 5) * 5;
  const pass = Math.abs(gotK - finalK) < 0.3 && Math.abs(gotC - cuota) <= 10;
  if (!pass) ok = false;
  console.log(pr / 1000 + 'k obras ' + ob / 1000 + 'k -> final ' + gotK + 'k (esp ' + finalK + 'k), cuota ' + gotC + ' (esp ' + cuota + ')', pass ? 'OK' : 'FALLA');
}
// Puntos sueltos
console.log('pmt 336k 2.60% 30a =', pmt(336000, 2.6, 30).toFixed(2), '(esp ~1345)');
console.log('pmt 336k 2.75% 30a =', pmt(336000, 2.75, 30).toFixed(2), '(esp 1371.69)');
console.log('IRPF 109k =', Math.round(irpfAhorro(109000)), '(esp ~24k)');
const d = calcular(DEFAULTS);
console.log('Defaults: M0', Math.round(d.hipotecaAlComprar), 'final', Math.round(d.hipotecaFinal), 'cuota puente', Math.round(d.cuotaMientrasVendeis), 'liquido final', Math.round(d.liquidoFinal));
console.log('Defaults: importe a reinvertir', Math.round(d.importeObtenido), 'venta max cubierta', Math.round(d.ventaMaxCubierta), 'parte tuya', Math.round(d.parteTuya), 'reinvierte', d.reinvierteTodo);
const c350 = calcular(Object.assign({}, DEFAULTS, { precio: 350000 }));
console.log('350k: reinvierte todo?', c350.reinvierteTodo, 'sin reinvertir', Math.round(c350.sinReinvertir));
const cap = calcular(Object.assign({}, DEFAULTS, { precio: 420000, obras: 100000, obrasAntes: 100000 }));
console.log('420k, 100k obras antes: M0', Math.round(cap.hipotecaAlComprar), 'falta entrada', Math.round(cap.faltaEntrada), 'liquido tras compra', Math.round(cap.liquidoTrasCompra), 'final', Math.round(cap.hipotecaFinal), 'liquido final', Math.round(cap.liquidoFinal));
console.log(ok ? 'TODO OK' : 'HAY FALLOS');
process.exit(ok ? 0 : 1);
