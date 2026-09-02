/**
 * @file ai-logic.js — Módulo de Inteligencia Artificial para Setas OS con Firebase AI Logic (Gemini API).
 *
 * Utiliza el SDK de Firebase AI Logic (Gemini Developer API) para:
 * 1. Extracción estructurada JSON de facturas, recibos y compras de insumos.
 * 2. Diagnóstico visual multimodal de patógenos y anomalías en bolsas de cultivo (Trichoderma, Cobweb, etc.).
 * 3. Asistente agronómico para parámetros de cultivo en Tenjo (2.600 msnm).
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

const CONTAMINATION_SCHEMA_PROMPT = `
Eres el experto micólogo y patólogo de cultivo de hongos de Setas de la Peña (Tenjo, Cundinamarca).
Analiza la fotografía de la bolsa/bloque de cultivo de hongos comestibles adjunta.

Debes emitir un dictamen técnico y devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "patogeno": "Nombre común y científico del patógeno detectado (ej. Trichoderma spp. / Moho Verde, Cobweb / Dactylium, Neurospora crassa / Moho Naranja, Bacteriosis / Wet Rot, Micelio Saludable, o Metabolitos de Estrés)",
  "tipo": "hongo_competidor | moho_parasito | bacteria | micelio_sano | estres_ambiental",
  "urgencia": "critica | alta | media | baja | ninguna",
  "confianza": "alta | media | baja",
  "descripcion_visual": "Explicación concisa y clara de los signos visibles identificados en la imagen (manchas, textura, coloración, etc.)",
  "accion_recomendada": "Protocolo específico de acción inmediata para el operario (ej. No abrir la bolsa dentro de la sala; sellar en bolsa plástica y retirar inmediatamente a zona de compostaje/descarte)",
  "posible_causa": "Causa más probable de esta anomalía (ej. Pasteurización insuficiente, exceso de humedad >70%, falla en filtro microporoso, etc.)",
  "estado_bolsa_sugerido": "contaminada | dudosa | descartada | sana"
}

Reglas agronómicas de diagnóstico de Setas de la Peña:
1. Si se observan manchas verde brillante o verde oliva oscuro sobre el micelio: es Trichoderma spp. Urgencia: alta. Acción: Aislar inmediatamente sin abrir la bolsa. Estado: contaminada.
2. Si se observan telarañas/fibras grisáceas muy finas creciendo velozmente sobre el sustrato/primordios: es Cobweb mold (Dactylium). Urgencia: media. Estado: dudosa o contaminada.
3. Si se observan colonias naranja o rojo brillante de rápido avance: es Neurospora crassa. Urgencia: critica. Acción: Retiro ultra urgente y desinfección profunda. Estado: contaminada.
4. Si se observan zonas viscosas cafés o marrón con aspecto húmedo: es Bacteriosis / Wet Rot. Urgencia: media. Estado: dudosa.
5. Si el micelio es blanco uniforme, tomentoso o rizomórfico denso: es Micelio Saludable. Urgencia: ninguna. Estado: sana.
6. Si solo se ven pequeñas gotas amarillas transparentes sobre micelio sano blanco: son Metabolitos de Estrés (exudado no patógeno). Urgencia: baja. Acción: Monitorear y ventilar. Estado: sana.
7. Devuelve SOLO el bloque JSON sin etiquetas markdown ni explicaciones externas.
`;

const FORMULATION_SCHEMA_PROMPT = `
Eres el perito agrónomo especializado de Setas de la Peña (Tenjo, Cundinamarca, 2.600 msnm).
Analiza la formulación actual del sustrato de cultivo y sus métricas agronómicas.

Debes proponer recomendaciones de ajuste agronómico y devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "diagnostico_agronomico": "Explicación clara del estado actual y cuello de botella o riesgo detectado",
  "meta_cn_sugerida": 28.0,
  "ajuste_suplementacion": "Recomendación específica sobre suplementación N o minerales",
  "ingredientes_sugeridos": ["id_ingrediente_1", "id_ingrediente_2"],
  "restricciones_sugeridas": {
    "maxSupp": 12,
    "preferTreatment": "thermal"
  },
  "confianza": "alta | media | baja"
}

Reglas agronómicas de Setas de la Peña:
1. No inventar cifras de masa balance: la matemática exacta la computa el motor determinístico SetasPeritoScenarios.
2. Si el C:N es muy bajo (<22) para Orellana o Melena de León, recomendar elevar bases de carbono (ej. kikuyo, hojarasca, paja) o reducir harina de soya / torta.
3. Si la tasa de suplementación supera los límites seguros de la especie, advertir riesgo de Trichoderma spp. y sugerir pasteurización térmica estricta o autoclave.
4. Devuelve SOLO el bloque JSON sin etiquetas markdown adicionales ni explicaciones externas.
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
  try {
    const direct = JSON.parse(trimmed);
    if (direct && typeof direct === 'object') return direct;
  } catch (_) {}

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
 * Normaliza y limpia una respuesta de texto para extraer el JSON válido de diagnóstico.
 * @param {string} text 
 * @returns {object}
 */
export function extractValidDiagnosisJson(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Respuesta vacía o inválida del modelo AI.');
  }

  const trimmed = text.trim();
  try {
    const direct = JSON.parse(trimmed);
    if (direct && typeof direct === 'object') return direct;
  } catch (_) {}

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      throw new Error(`Error al decodificar JSON del diagnóstico: ${e.message}`);
    }
  }

  throw new Error('No se encontró una estructura JSON válida en la respuesta del diagnóstico.');
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
 * Construye el prompt contextualizado para recomendaciones de formulación.
 * @param {object} params
 * @returns {string}
 */
export function buildFormulationPrompt({ currentRecipe = [], analysis = {}, targetKey = 'orellana_gris', anomalyOrGoal = '', speciesName = '', knownIngredients = [] } = {}) {
  let prompt = FORMULATION_SCHEMA_PROMPT;
  const details = [];
  if (speciesName || targetKey) details.push(`Especie de hongo: ${speciesName || targetKey}`);
  if (analysis.cn !== undefined) details.push(`C:N actual: ${analysis.cn}`);
  if (analysis.n !== undefined) details.push(`Nitrógeno N%: ${analysis.n}%`);
  if (analysis.be !== undefined) details.push(`Eficiencia Biológica (EB) estimada: ${analysis.be}%`);
  if (analysis.cost !== undefined) details.push(`Costo estimado/kg: $${analysis.cost}`);
  if (analysis.risk !== undefined) details.push(`Nivel de riesgo de contaminación: ${analysis.risk}`);
  if (Array.isArray(currentRecipe) && currentRecipe.length > 0) {
    const items = currentRecipe.map(r => `${r.id}: ${r.p || r.pct}%`).join(', ');
    details.push(`Receta actual: [${items}]`);
  }
  if (anomalyOrGoal) details.push(`Objetivo o problema reportado por el operario: ${anomalyOrGoal}`);
  if (Array.isArray(knownIngredients) && knownIngredients.length > 0) {
    const names = knownIngredients.map(g => `${g.id} (${g.name || g.id})`).join(', ');
    details.push(`Ingredientes disponibles en catálogo/bodega: ${names}`);
  }

  prompt += `\n\nContexto actual de la formulación:\n${details.join('\n')}`;
  return prompt;
}

/**
 * Construye el prompt contextualizado para diagnóstico visual.
 * @param {object} context 
 * @returns {string}
 */
export function buildDiagnosisPrompt(context = {}) {
  let prompt = CONTAMINATION_SCHEMA_PROMPT;
  const details = [];
  if (context.speciesName) details.push(`Especie cultivada: ${context.speciesName}`);
  if (context.stage) details.push(`Etapa actual: ${context.stage}`);
  if (context.roomName) details.push(`Ubicación: ${context.roomName}`);
  if (context.notes) details.push(`Observación del operario: ${context.notes}`);
  if (details.length > 0) {
    prompt += `\n\nContexto agronómico del lote evaluado:\n${details.join('\n')}`;
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

    /**
     * Diagnostica una foto de una bolsa sospechosa con Gemini.
     * @param {object} params
     * @param {string} params.base64Data Cadena base64 pura de la fotografía
     * @param {string} [params.mimeType] Tipo MIME (image/jpeg, image/png, image/webp)
     * @param {string} [params.speciesName] Especie del lote
     * @param {string} [params.stage] Etapa del cultivo
     * @param {string} [params.roomName] Sala/Cámara
     * @param {string} [params.notes] Notas adicionales del operario
     * @returns {Promise<object>}
     */
    async diagnoseContaminationImage({ base64Data, mimeType = 'image/jpeg', speciesName = '', stage = '', roomName = '', notes = '' }) {
      if (!base64Data) {
        throw new Error('Se requiere la fotografía de la bolsa en formato base64.');
      }

      const prompt = buildDiagnosisPrompt({ speciesName, stage, roomName, notes });

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
        return extractValidDiagnosisJson(text);
      }

      if (typeof window !== 'undefined' && window.claude && typeof window.claude.complete === 'function') {
        const fileBlock = { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Data } };
        const resp = await window.claude.complete({
          messages: [
            {
              role: 'user',
              content: [fileBlock, { type: 'text', text: prompt }],
            },
          ],
        });
        return extractValidDiagnosisJson(typeof resp === 'string' ? resp : JSON.stringify(resp));
      }

      throw new Error('El servicio de IA no está disponible para análisis visual.');
    },

    /**
     * Sugiere ajustes agronómicos de formulación usando Gemini.
     * @param {object} params
     * @param {Array} [params.currentRecipe] Receta actual
     * @param {object} [params.analysis] Métricas del sustrato (cn, n, be, cost, risk)
     * @param {string} [params.targetKey] Especie objetivo
     * @param {string} [params.anomalyOrGoal] Meta o problema reportado
     * @param {string} [params.speciesName] Nombre visible de la especie
     * @param {Array} [params.knownIngredients] Catálogo/ingredientes de bodega
     * @returns {Promise<object>}
     */
    async suggestFormulationAdjustments({ currentRecipe = [], analysis = {}, targetKey = 'orellana_gris', anomalyOrGoal = '', speciesName = '', knownIngredients = [] } = {}) {
      const prompt = buildFormulationPrompt({ currentRecipe, analysis, targetKey, anomalyOrGoal, speciesName, knownIngredients });

      if (defaultModel && typeof defaultModel.generateContent === 'function') {
        const result = await defaultModel.generateContent(prompt);
        const text = result?.response?.text ? result.response.text() : String(result?.response || '');
        return extractValidDiagnosisJson(text);
      }

      if (typeof window !== 'undefined' && window.claude && typeof window.claude.complete === 'function') {
        const resp = await window.claude.complete({
          messages: [{ role: 'user', content: prompt }],
        });
        return extractValidDiagnosisJson(typeof resp === 'string' ? resp : JSON.stringify(resp));
      }

      throw new Error('El servicio de IA no está disponible para sugerir ajustes de formulación.');
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
