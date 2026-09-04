# Firebase — Setas OS

## Desplegar reglas de Firestore

No lo hace el agente — requiere tu cuenta de Firebase.

```
cd field-os-simulador/setas-os
npm install -g firebase-tools   # si no lo tienes
firebase login
firebase deploy --only firestore:rules --project sdlp-os
```

## Ficha pública de trazabilidad (`public_lotes`)

Las cuentas que sincronizan lotes/cosechas a `public_lotes` (ver
`public-trace-sync.js`) necesitan el custom claim `sync_service: true` en su
token de Auth, o el rol `admin` en `usuarios/{uid}.rol`. Sin uno de los dos,
las reglas rechazan la escritura (ver `firestore.rules`).

Para asignar el claim a una cuenta operativa:

```
npm install --no-save firebase-admin
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  node firebase/scripts/asignar-sync-claim.js operador@setasdelapena.co
```

La cuenta debe cerrar sesión y volver a entrar (o refrescar su ID token)
para que el claim tome efecto en el cliente.

## Pruebas de las reglas (`test/firestore.rules.test.js`)

Requieren el emulador de Firestore (Java 11+ instalado) y las
`devDependencies` del `package.json` de este mismo paquete
(`@firebase/rules-unit-testing`, `firebase`, `mocha`, `firebase-tools`).

```
cd field-os-simulador/setas-os
npm install
npm run test:rules
```

`test:rules` levanta el emulador, corre las pruebas y lo apaga
(`firebase emulators:exec`). Si prefieres dejarlo corriendo entre corridas:

```
npx firebase emulators:start --only firestore   # deja esta terminal abierta
npm run test:rules:only                          # en otra terminal
```

Las pruebas cubren:

- Lectura pública sin autenticar.
- Un usuario autenticado normal (sin claim ni rol admin) no puede escribir.
- Una sesión sin autenticar tampoco puede escribir.
- El "sync service" (claim `sync_service: true`) sí puede crear/actualizar/borrar.
- Un usuario con rol `admin` también puede.
- Se rechaza cualquier documento con un campo prohibido (`costo`, `recetaSnapshot`, etc.), incluso viniendo del sync service.
- Se rechazan tipos/rangos inválidos (`numBolsas` no entero o negativo, `calidad` fuera de 0–5).
