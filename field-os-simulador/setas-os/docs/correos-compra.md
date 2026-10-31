# Correos de compra → Bodega

Los correos de proveedores (confirmaciones de pedido, facturas) llegan a
**Bodega → Compra → Correos**. Desde ahí cada correo se abre en el formulario
de Compra, lo lee el mismo lector de facturas de "Pegar texto", y una persona
revisa ítems, kilos y precio antes de registrarlo.

- Un correo **nunca** registra una compra solo, ni mueve stock.
- Por defecto entra como **Por recibir**: un correo confirma un pedido, no una
  entrega. El stock físico cambia al confirmar la recepción.
- Cada correo se reconoce por su encabezado `Message-ID`: importarlo dos veces,
  desde dos equipos o por los dos caminos de abajo, no duplica nada.
- Al registrar un correo con un proveedor elegido, ese proveedor aprende el
  remitente (`remitenteCorreo`), y sus próximos correos llegan ya emparejados.
  También se puede escribir al crear el proveedor.

## Facturas adjuntas (DIAN)

La factura electrónica casi nunca viene en el cuerpo ("adjunto factura"): llega
como ZIP con PDF + XML, o como PDF suelto. La función programada lee los
adjuntos (`functions/invoice-attachments.js`) y guarda en el documento:

- `factura`: número, fecha, proveedor, NIT, total y las líneas del XML UBL
  (descripción, cantidad, unidad, precio unitario; kilos y precio por kilo
  cuando la unidad es de masa). Reconoce el sobre `AttachedDocument` de la
  DIAN. Una nota crédito se marca como tal y no aporta líneas.
- `adjuntoTexto`: el texto del PDF (pdf-parse), sólo si ningún XML trajo
  líneas. Un PDF escaneado sin capa de texto queda como `sin_texto`.
- `adjuntos`: qué llegó y qué se pudo leer (`leido`, `sin_lineas`, `sin_leer`,
  `sin_texto`, `ilegible`, `muy_grande`, `nota_credito`).

No se guardan los archivos: el documento queda en unas decenas de KB como
mucho (topes de 150 líneas, 6000 caracteres de PDF y una red de seguridad de
200 KB en `ajustarTamano`). Al revisar, el lector de facturas recibe las
líneas del XML en vez del cuerpo; sin XML, el texto del PDF; sin nada, el
cuerpo. La fecha de la compra se toma de la factura. El XML y el ZIP vienen de
un tercero: se leen sin parser de entidades y con topes contra bombas de
compresión, y como todo correo, sólo prellenan el formulario.

Código: `purchase-email-inbox.js` (lógica compartida),
`firebase/correos-compra-sync.js` (cliente), `functions/import-purchase-emails.js`,
`functions/gmail-imap.js` y `functions/invoice-attachments.js` (servidor).

## Dos caminos para traer los correos

### 1. Automático: función programada (cada 30 min)

`importarCorreosCompra` lee Gmail por IMAP y crea un documento por correo en
`correos_compra`. Requiere el plan Blaze de Firebase. Configuración, una vez:

1. Crear una contraseña de aplicación de Google para la cuenta
   (myaccount.google.com → Seguridad → Verificación en 2 pasos → Contraseñas de
   aplicaciones). Gmail → Configuración → Reenvío e IMAP → IMAP habilitado.
2. Guardarla como secreto (la pide por teclado, no queda en el repositorio):

   ```bash
   firebase functions:secrets:set GMAIL_APP_PASSWORD
   ```

3. Definir la cuenta en `functions/.env` (no se versiona):

   ```bash
   echo "GMAIL_USER=la-cuenta@gmail.com" > functions/.env
   ```

4. Desplegar reglas y funciones:

   ```bash
   firebase deploy --only firestore:rules,functions
   ```

La función sólo lee: no marca, mueve ni borra correos en Gmail. Revisa los
últimos 3 días en cada corrida (cubre corridas que fallaron). Busca remitentes
de Homecenter, MercadoLibre/MercadoPago y Rappi, más el `remitenteCorreo` de
cada proveedor registrado. De los conocidos sólo toma los que tienen asunto de
pedido o factura; de un proveedor registrado, todos.

### 2. Manual: `fetch_gmail.py`

Sin desplegar nada. En la raíz del repositorio:

```bash
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx python3 fetch_gmail.py
```

Genera `sdp_emails.json`. En Setas OS: Bodega → Compra → Correos → **Importar
archivo de correos**. Los correos importados así sólo existen en ese equipo.
