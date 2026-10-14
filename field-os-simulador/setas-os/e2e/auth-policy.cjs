'use strict';

const requiresAuth = (env = process.env) => env.E2E_REQUIRE_AUTH === 'true';

// Sólo la ausencia explícita de credenciales permite omitir tests locales/PR.
// Una sesión que falla después del setup siempre es una regresión del recorrido.
function skipIfAuthUnavailable(test) {
  if (process.env.E2E_AUTH_UNAVAILABLE !== 'true') return;
  if (requiresAuth()) throw new Error('La validación de release requiere una sesión de Firebase Auth.');
  test.skip(true, 'Requiere credenciales E2E_TEST_EMAIL / E2E_TEST_PASSWORD');
}

module.exports = { requiresAuth, skipIfAuthUnavailable };
