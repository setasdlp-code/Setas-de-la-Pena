/**
 * @file ai-logic.js — Módulo de Inteligencia Artificial para Setas OS con Firebase AI Logic (Gemini API).
 *
 * Utiliza el SDK de Firebase AI Logic (Gemini Developer API) para:
 * 1. Extracción estructurada JSON de facturas, recibos y mensajes de compra de insumos.
 * 2. Diagnóstico visual multimodal de imágenes en campo.
 * 3. Asistente agronómico para consultas sobre parámetros de cultivo en Tenjo.
 */

const INVOICE_SCHEMA_PROMPT = `
Eres el asistente agronómico y contable de Setas de la Peña (Tenjo, Cundinamarca).
Analiza el documento o texto proporcionado (factura, recibo, remisión o mensaje de WhatsApp/email) de compra de insumos para cultivo de hongos comestibles.

Debes extraer todos los ítems comprados y devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "proveedor": "Nombre del proveedor o vendedor tal cual aparece (o null si no se identifica)",
  "fecha": "Fecha de la compra en formato YYYY-MM-DD (o null si no aparece)",
  "items": [
    {
      "ingrediente": "Nombre del insumo tal cual aparece en el documento",
      "kg": 0.0,
      "precio": 0
    }
  ]
}

Reglas críticas de extracción:
1. "kg": Cantidad total en kilogramos (número decimal). Si viene en bultos (ej. bulto de 40 kg o 50 kg), convierte a kg totales (ej. 3 bultos de 40kg = 120).
2. "precio": Precio unitario por kilogramo en Pesos Colombianos (COP). Si la factura trae el precio total de la línea, calcula el precio/kg dividiendo (precio_total / kg).
3. Ignora subtotales, impuestos (IVA), costos de flete y totales generales.
4. Devuelve SOLO el bloque JSON sin etiquetas markdown adicionales ni explicaciones.
`;

/**
 * Normaliza y limpia una respuesta de texto para extraer el JSON válido.
 * @param {string} text 
 * @returns {object}
 */
export function extractValidInvoiceJson(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Respuesta vacía o inválida del modelo AI.');
  }

  const trimmed = text.trim();
  // Intento directo de parseo
  try {
    const direct = JSON.parse(trimmed);
    if (direct && typeof direct === 'object') return direct;
  } catch (_) {}

  // Buscar bloque entre llaves { ... }
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      throw new Error(`Error al decodificar JSON de la respuesta: ${e.message}`);
    }
  }

  throw new Error('No se encontró una estructura JSON válida en la respuesta.');
}

/**
 * Construye el prompt contextualizado con la lista de ingredientes conocidos.
 * @param {Array<{id:string, name:string}>} knownIngredients 
 * @param {string} [extraContext]
 * @returns {string}
 */
export function buildInvoicePrompt(knownIngredients = [], extraContext = '') {
  let prompt = INVOICE_SCHEMA_PROMPT;
  if (Array.isArray(knownIngredients) && knownIngredients.length > 0) {
    const names = knownIngredients.map(g => g.name || g.id).join(', ');
    prompt += `\n\nIngredientes conocidos del inventario de la granja (asocia cada ítem al más cercano si corresponde):\n${names}`;
  }
  if (extraContext) {
    prompt += `\n\nContexto adicional del operario:\n${extraContext}`;
  }
  return prompt;
}

/**
 * Inicializa los servicios de Firebase AI Logic y expone la API unificada.
 * @param {object} [firebaseApp] Instancia de Firebase App
 * @returns {object} API de SetasAI
 */
export function initSetasAI(firebaseApp) {
  let aiService = null;
  let defaultModel = null;

  try {
    const fbAI = typeof window !== 'undefined' ? (window.firebase?.ai || window.SetasFirebase?.ai) : null;
    if (fbAI && firebaseApp && typeof fbAI.getAI === 'function') {
      aiService = fbAI.getAI(firebaseApp, { backend: new fbAI.GoogleAIBackend() });
      defaultModel = fbAI.getGenerativeModel(aiService, {
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
    }
  } catch (err) {
    console.warn('[Setas AI] Inicialización de SDK Firebase AI en modo diferido/fallback:', err);
  }

  const SetasAI = {
    isAvailable: () => true,

    /**
     * Parsea una foto o documento PDF de factura de insumos con Gemini.
     * @param {object} params
     * @param {string} params.base64Data Cadena base64 pura del archivo
     * @param {string} params.mimeType Tipo MIME (image/jpeg, image/png, application/pdf)
     * @param {Array} [params.knownIngredients] Lista de ingredientes conocidos
     * @returns {Promise<{proveedor:string|null, fecha:string|null, items:Array}>}
     */
    async parseInvoiceImage({ base64Data, mimeType = 'image/jpeg', knownIngredients = [] }) {
      if (!base64Data) {
        throw new Error('Se requiere el contenido en base64 de la imagen o PDF.');
      }

      const prompt = buildInvoicePrompt(knownIngredients);

      if (defaultModel && typeof defaultModel.generateContent === 'function') {
        const result = await defaultModel.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
        ]);
        const text = result?.response?.text ? result.response.text() : String(result?.response || '');
        return extractValidInvoiceJson(text);
      }

      if (typeof window !== 'undefined' && window.claude && typeof window.claude.complete === 'function') {
        const isPDF = mimeType === 'application/pdf';
        const fileBlock = isPDF
          ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } }
          : { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Data } };

        const resp = await window.claude.complete({
          messages: [
            {
              role: 'user',
              content: [fileBlock, { type: 'text', text: prompt }],
            },
          ],
        });
        return extractValidInvoiceJson(typeof resp === 'string' ? resp : JSON.stringify(resp));
      }

      throw new Error('El servicio de IA no está configurado en este navegador. Ingresa los datos manualmente.');
    },

    /**
     * Parsea un texto pegado de WhatsApp/Email de un proveedor.
     * @param {object} params
     * @param {string} params.text Mensaje de texto a analizar
     * @param {Array} [params.knownIngredients] Lista de ingredientes conocidos
     * @returns {Promise<{proveedor:string|null, fecha:string|null, items:Array}>}
     */
    async parseInvoiceText({ text, knownIngredients = [] }) {
      if (!text || !text.trim()) {
        throw new Error('El texto para interpretar no puede estar vacío.');
      }

      const prompt = `${buildInvoicePrompt(knownIngredients)}\n\nMensaje recibido del proveedor:\n"""${text}"""`;

      if (defaultModel && typeof defaultModel.generateContent === 'function') {
        const result = await defaultModel.generateContent(prompt);
        const resText = result?.response?.text ? result.response.text() : String(result?.response || '');
        return extractValidInvoiceJson(resText);
      }

      if (typeof window !== 'undefined' && window.claude && typeof window.claude.complete === 'function') {
        const resp = await window.claude.complete({
          messages: [{ role: 'user', content: prompt }],
        });
        return extractValidInvoiceJson(typeof resp === 'string' ? resp : JSON.stringify(resp));
      }

      throw new Error('El servicio de IA no está disponible. Ingresa los ítems en modo Manual.');
    },
  };

  if (typeof window !== 'undefined') {
    window.SetasAI = SetasAI;
    window.dispatchEvent(new CustomEvent('setas-ai-ready', { detail: SetasAI }));
  }

  return SetasAI;
}

if (typeof window !== 'undefined') {
  if (window.SetasFirebase?.app) {
    initSetasAI(window.SetasFirebase.app);
  } else {
    window.addEventListener('setas-firebase-ready', () => {
      initSetasAI(window.SetasFirebase?.app);
    });
  }
}
