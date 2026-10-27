'use strict';
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#print-species').addEventListener('click', () => window.print());
const closedDetails = new Set();
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('details').forEach(detail => {
    if (!detail.open) closedDetails.add(detail);
    detail.open = true;
  });
});
window.addEventListener('afterprint', () => {
  closedDetails.forEach(detail => { detail.open = false; });
  closedDetails.clear();
});

// La solicitud se prepara en el navegador. Solo se comparte cuando el cliente decide hacerlo.
(() => {
  const data = window.SetasCommerce || {};
  const form = document.querySelector('#order-form');
  const quantity = document.querySelector('#order-quantity');
  const municipality = document.querySelector('#order-municipality');
  const review = document.querySelector('#order-review');
  const message = document.querySelector('#order-message');
  const whatsappLink = document.querySelector('#order-whatsapp');
  const copyStatus = document.querySelector('#copy-status');
  const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  const count = new Intl.NumberFormat('es-CO');
  const text = value => typeof value === 'string' ? value.trim() : '';
  const isPrice = value => Number.isSafeInteger(value) && value >= 0;
  const formatPrice = value => `${money.format(value)} COP`;
  const formatWeight = value => value % 1000 === 0 ? `${count.format(value / 1000)} kg` : `${count.format(value)} g`;
  const setText = (selector, value) => { document.querySelector(selector).textContent = value; };
  const recipes = window.SetasRecipes || {};
  const params = new URLSearchParams(location.search);
  if (params.get('purpose') === 'restaurante') {
    form.querySelector('input[name="purpose"][value="restaurante"]').checked = true;
  }
  const scaleParam = params.get('scale');
  const recipeId = params.get('recipe');
  // Solo identificadores conocidos y factor 1, 2 o 3: cualquier otro valor deja la consulta normal.
  const validScale = scaleParam === null || /^[123]$/.test(scaleParam);
  let recipe = recipeId && validScale && Object.hasOwn(recipes, recipeId) ? { id: recipeId, ...recipes[recipeId], scale: Number(scaleParam || 1) } : null;
  if (recipe) { recipe.baseGrams = recipe.grams; recipe.grams = recipe.baseGrams * recipe.scale; }
  const recipeBox = document.querySelector('#recipe-context');
  const recipeGrams = document.querySelector('#recipe-grams');
  const differenceRow = document.querySelector('#order-difference-row');
  const seen = new Set();
  const presentations = (Array.isArray(data.presentations) ? data.presentations : []).filter(item => {
    if (!item || !text(item.id) || seen.has(item.id) || !text(item.name) || !Number.isSafeInteger(item.weightGrams) || item.weightGrams <= 0) return false;
    seen.add(item.id);
    return true;
  }).map(item => ({ ...item, priceCOP: isPrice(item.priceCOP) ? item.priceCOP : null }));
  const available = data.availability === 'available';
  const availability = available ? 'Disponible' : data.availability === 'unavailable' ? 'No disponible por ahora' : 'Disponibilidad por confirmar';
  const phone = text(data.whatsapp).replace(/[\s()-]/g, '');
  const whatsapp = /^\+[1-9]\d{7,14}$/.test(phone) ? phone.slice(1) : null;
  const deliveryFee = isPrice(data.deliveryFeeCOP) ? data.deliveryFeeCOP : null;
  const deliveryText = deliveryFee === null ? 'Por confirmar' : deliveryFee === 0 ? 'Sin costo · confirmar cobertura' : `${formatPrice(deliveryFee)} · confirmar cobertura`;

  document.querySelectorAll('[data-availability]').forEach(element => { element.textContent = availability; });
  setText('#availability-detail', text(data.availabilityNote) || (available ? 'La cantidad y la entrega requieren confirmación al preparar la solicitud.' : data.availability === 'unavailable' ? 'Es posible consultar la próxima disponibilidad.' : 'La disponibilidad y las presentaciones se confirman al consultar.'));
  setText('#delivery-areas', text(data.deliveryAreas) || 'Por confirmar para el municipio indicado');
  setText('#delivery-days', text(data.deliveryDays) || 'Se acuerdan al consultar');
  setText('#delivery-fee', deliveryText);
  setText('#payment-methods', text(data.paymentMethods) || 'Se confirman con el pedido');
  setText('#product-batch', text(data.batch) || 'Sin registro publicado');
  setText('#product-harvest', text(data.harvestDate) || 'Sin registro publicado');
  if (text(data.deliveryAreas)) setText('#municipality-hint', `Cobertura publicada: ${text(data.deliveryAreas)}. Confirmaremos la entrega para el municipio indicado.`);

  if (presentations.length) {
    document.querySelector('#presentation-field').hidden = false;
    setText('#quantity-label', 'Número de presentaciones');
    setText('#quantity-hint', 'El total usa el peso declarado de la presentación; el peso limpio aprovechable se confirma por separado.');
    quantity.value = '1';
    presentations.forEach((item, index) => {
      const label = document.createElement('label');
      label.className = 'purchase-option';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'presentation';
      radio.value = String(index);
      radio.checked = index === 0;
      const copy = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = item.name;
      const detail = document.createElement('span');
      detail.textContent = `${formatWeight(item.weightGrams)} · ${item.priceCOP === null ? 'Precio por confirmar' : formatPrice(item.priceCOP)}`;
      copy.append(name, detail);
      label.append(radio, copy);
      document.querySelector('#presentation-options').append(label);
    });
  }

  if (recipe) {
    recipeBox.hidden = false;
    setText('#recipe-context-text', `Cantidad de referencia para ${recipe.name}${recipe.scale > 1 ? ` (×${recipe.scale})` : ''}: ${formatWeight(recipe.grams)} de shiitake fresco limpio. Cantidad editable; peso de compra sujeto a presentación y merma.`);
    if (presentations.length) {
      document.querySelector('#recipe-grams-field').hidden = false;
      recipeGrams.value = String(recipe.grams);
      proposeUnits();
    } else quantity.value = String(recipe.grams);
  }

  function selectedItem() {
    return presentations.length ? presentations[Number(form.elements.namedItem('presentation').value)] : null;
  }

  // Gramos que pide la receta (si hay contexto) frente a presentaciones: nunca se mezclan en un mismo campo.
  function neededGrams() {
    if (!recipe || !presentations.length) return null;
    const grams = Number(recipeGrams.value);
    return recipeGrams.value !== '' && Number.isSafeInteger(grams) && grams > 0 ? grams : null;
  }

  function proposeUnits() {
    const needed = neededGrams();
    if (needed !== null) quantity.value = String(Math.ceil(needed / selectedItem().weightGrams));
  }

  function selection() {
    const item = selectedItem();
    const units = Number(quantity.value);
    const weight = units * (item ? item.weightGrams : 1);
    const subtotal = item && item.priceCOP !== null ? units * item.priceCOP : null;
    const needed = neededGrams();
    const valid = quantity.value !== '' && Number.isSafeInteger(units) && units > 0 && Number.isSafeInteger(weight) && (subtotal === null || Number.isSafeInteger(subtotal)) && (!recipe || !presentations.length || needed !== null);
    return { item, units, weight, subtotal, needed, valid };
  }

  function describeDifference(selected) {
    const gap = selected.weight - selected.needed;
    return gap === 0 ? `${formatWeight(selected.weight)} declarados · peso limpio aprovechable por confirmar` : `${formatWeight(selected.weight)} declarados · ${formatWeight(Math.abs(gap))} ${gap > 0 ? 'más' : 'menos'} que el peso solicitado, sin descontar merma; peso limpio aprovechable por confirmar`;
  }

  function updateSummary() {
    const selected = selection();
    quantity.setCustomValidity(selected.valid || quantity.value === '' ? '' : 'Indicar una cantidad entera positiva dentro del rango admitido.');
    if (recipe && presentations.length) recipeGrams.setCustomValidity(selected.needed !== null || recipeGrams.value === '' ? '' : 'Indicar los gramos como un entero positivo.');
    differenceRow.hidden = !(selected.valid && selected.needed !== null);
    if (!differenceRow.hidden) setText('#order-difference', describeDifference(selected));
    setText('#order-weight', selected.valid ? formatWeight(selected.weight) : '—');
    setText('#order-subtotal', !selected.valid ? '—' : selected.subtotal === null ? 'Precio por confirmar' : formatPrice(selected.subtotal));
    setText('#order-delivery', deliveryFee === null ? 'Cobertura y costo por confirmar' : deliveryText);
    setText('#offer-format', selected.item ? `${selected.item.name} · ${formatWeight(selected.item.weightGrams)}` : 'El formato se acuerda al consultar');
    setText('#offer-price', selected.item && selected.item.priceCOP !== null ? `${formatPrice(selected.item.priceCOP)} / presentación` : 'Por confirmar');
    document.querySelector('.purchase-submit').firstChild.textContent = available && selected.item && selected.item.priceCOP !== null ? 'Preparar solicitud ' : noChannel ? 'Preparar borrador ' : 'Preparar consulta ';
  }

  function clearReview() {
    review.hidden = true;
    whatsappLink.hidden = true;
    whatsappLink.removeAttribute('href');
    message.value = '';
    copyStatus.textContent = '';
  }

  form.addEventListener('input', event => {
    municipality.setCustomValidity('');
    clearReview();
    if (recipe && presentations.length && (event.target === recipeGrams || event.target.name === 'presentation')) proposeUnits();
    updateSummary();
  });
  document.querySelector('#recipe-clear').addEventListener('click', () => {
    recipe = null;
    recipeBox.hidden = true;
    recipeGrams.setCustomValidity('');
    const url = new URL(location.href);
    url.searchParams.delete('recipe');
    url.searchParams.delete('scale');
    history.replaceState(null, '', url);
    clearReview();
    updateSummary();
    quantity.focus();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    municipality.setCustomValidity(text(municipality.value) ? '' : 'Falta el municipio de entrega.');
    updateSummary();
    if (!form.reportValidity()) return;
    const selected = selection();
    if (!selected.valid) return;
    const purpose = form.elements.namedItem('purpose').value === 'restaurante' ? 'mi restaurante' : 'cocinar en casa';
    const location = text(municipality.value).replace(/\s+/g, ' ');
    const lines = [
      'Hola, Setas de la Peña.',
      `Me interesa el shiitake para ${purpose}.`,
      ...(recipe ? [`Quiero cocinar ${recipe.name} (${recipe.scale > 1 ? `versión ×${recipe.scale}; ` : ''}la receta base usa ${formatWeight(recipe.baseGrams)} de shiitake fresco limpio).`] : []),
      ...(recipe && selected.needed !== null ? [`Necesito unos ${formatWeight(selected.needed)} para la receta.`] : []),
      ...(recipe ? ['La receta indica peso limpio aprovechable; quisiera confirmar el peso de compra según la presentación y su merma.'] : []),
      selected.item ? `Presentación solicitada: ${selected.item.name} (${formatWeight(selected.item.weightGrams)}).` : 'Presentación: por confirmar.',
      selected.item ? `Cantidad: ${count.format(selected.units)} ${selected.units === 1 ? 'presentación' : 'presentaciones'} (${formatWeight(selected.weight)} en total).` : `Cantidad solicitada: ${formatWeight(selected.weight)}.`,
      ...(recipe && selected.needed !== null ? [`Peso declarado de las presentaciones: ${describeDifference(selected)}.`] : []),
      selected.subtotal === null ? 'Precio: por confirmar.' : `Subtotal del producto: ${formatPrice(selected.subtotal)} (sin envío).`,
      `Municipio de entrega: ${location}.`,
      ...(purpose === 'mi restaurante' && text(form.elements.namedItem('frequency').value) ? [`Frecuencia de compra: ${text(form.elements.namedItem('frequency').value)}.`] : []),
      ...(purpose === 'mi restaurante' && text(form.elements.namedItem('desired').value) ? [`Fecha deseada: ${text(form.elements.namedItem('desired').value)}.`] : []),
      deliveryFee === null ? 'Costo de entrega: por confirmar.' : `Costo de entrega publicado: ${deliveryText}.`,
      '',
      data.availability === 'unavailable' ? '¿Cuándo esperan tener disponibilidad? Quisiera confirmar presentación, valor final, entrega y medios de pago.' : '¿Pueden confirmar disponibilidad, presentación, valor final, entrega y medios de pago?'
    ];
    message.value = lines.join('\n');
    if (whatsapp) {
      const target = new URL(`https://wa.me/${whatsapp}`);
      target.searchParams.set('text', message.value);
      whatsappLink.href = target.href;
      whatsappLink.textContent = available && selected.subtotal !== null ? 'Solicitar pedido por WhatsApp ↗' : 'Consultar por WhatsApp ↗';
      whatsappLink.hidden = false;
      setText('#contact-note', 'El enlace abre el mensaje en WhatsApp; el envío es manual. El pedido requiere confirmación de Setas de la Peña.');
    }
    review.hidden = false;
    review.focus({ preventScroll: true });
    review.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  document.querySelector('#copy-order').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(message.value);
      copyStatus.textContent = 'Mensaje copiado.';
    } catch {
      message.focus();
      message.select();
      copyStatus.textContent = 'Mensaje seleccionado. Para copiar, usar el menú del dispositivo o Ctrl/Cmd + C.';
    }
  });
  const noChannel = !whatsapp;
  document.querySelector('#channel-notice').hidden = !noChannel;
  const submitButton = document.querySelector('.purchase-submit');
  const restaurantFields = document.querySelector('#restaurant-fields');
  const syncPurpose = () => { restaurantFields.hidden = form.elements.namedItem('purpose').value !== 'restaurante'; };
  form.addEventListener('change', event => { if (event.target.name === 'purpose') syncPurpose(); });
  syncPurpose();
  if (noChannel) {
    document.querySelector('#review-title').textContent = 'Borrador listo (aún no enviado).';
    document.querySelector('.purchase-confirmation').textContent = 'Todavía no hay un canal de consultas habilitado: este mensaje es un borrador que se prepara en el navegador y no se envía a nadie.';
  }
  updateSummary();
  form.hidden = false;
})();
