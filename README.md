# Casa de Foios

Web del proyecto de reforma de la casa de Foios (HTML/JS estático, sin dependencias).

- `index.html`: memoria del proyecto (criterios, salón, baño, envolvente, cambra, pendientes).
- `maqueta/`: maqueta 3D interactiva de la planta baja (WebGL propio).
- `presupuesto/`: partidas editables con precios orientativos.
- `calculadora/`: calculadora de hipoteca, cuota y colchón al comprar la casa y vender el piso.
  Modelo en `model.js`, plantilla en `template.html`; `python3 build.py` genera `index.html` y `node test.js` comprueba el modelo.
- `img/`: planos y vistas base.

Los valores por defecto de la calculadora son personales.
