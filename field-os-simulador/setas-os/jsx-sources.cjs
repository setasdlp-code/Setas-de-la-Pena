'use strict';
// Fuentes JSX de simulador-app.js, en orden de concatenación.
//
// build.js las une en un solo texto y lo transpila en un único paso; el
// resultado sigue siendo un solo bundle con un solo ámbito de módulo, igual que
// cuando todo vivía en simulador-app.jsx. No hay imports entre estos archivos:
// comparten ámbito, así que un nombre declarado en uno es visible en los demás.
//
// Reglas para un archivo de views/:
//   1. Solo declaraciones de nivel superior (componentes, hooks, helpers). Nada
//      que al evaluarse use un nombre declarado en un archivo posterior de esta
//      lista: sería un ReferenceError al cargar. Usarlo dentro de una función
//      o de un componente sí es válido, porque corre después de cargar todo.
//   2. Un nombre de nivel superior no puede repetirse entre archivos.
//   3. simulador-app.jsx va al final: registra window.SimuladorApp y ya
//      encuentra declarado todo lo anterior.
//
// Agregar un archivo aquí es todo lo que hace falta para que entre al build, al
// hash de build.test.js y a los hooks.
module.exports = [
  'views/app-icon.jsx',
  'views/lab.jsx',
  'views/public-traceability-modal.jsx',
  'views/iot-hub-modal.jsx',
  'views/field-action-modal.jsx',
  'simulador-app.jsx',
];
