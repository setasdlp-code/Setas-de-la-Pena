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
  setText('#availability-detail', text(data.availabilityNote) || (available ? 'Confirma la cantidad y la entrega al preparar tu solicitud.' : data.availability === 'unavailable' ? 'Puedes consultar cuándo volverá a estar disponible.' : 'La disponibilidad y las presentaciones se confirman al consultar.'));
  setText('#delivery-areas', text(data.deliveryAreas) || 'Por confirmar para tu municipio');
  setText('#delivery-days', text(data.deliveryDays) || 'Se acuerdan al consultar');
  setText('#delivery-fee', deliveryText);
  setText('#payment-methods', text(data.paymentMethods) || 'Se confirman con el pedido');
  setText('#product-batch', text(data.batch) || 'Sin registro publicado');
  setText('#product-harvest', text(data.harvestDate) || 'Sin registro publicado');
  if (text(data.deliveryAreas)) setText('#municipality-hint', `Cobertura publicada: ${text(data.deliveryAreas)}. Confirmaremos la entrega para tu municipio.`);

  if (presentations.length) {
    document.querySelector('#presentation-field').hidden = false;
    setText('#quantity-label', 'Número de presentaciones');
    setText('#quantity-hint', 'El peso total se calcula según la presentación elegida.');
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

  function selection() {
    const selected = form.elements.namedItem('presentation');
    const item = presentations.length ? presentations[Number(selected.value)] : null;
    const units = Number(quantity.value);
    const weight = units * (item ? item.weightGrams : 1);
    const subtotal = item && item.priceCOP !== null ? units * item.priceCOP : null;
    const valid = quantity.value !== '' && Number.isSafeInteger(units) && units > 0 && Number.isSafeInteger(weight) && (subtotal === null || Number.isSafeInteger(subtotal));
    return { item, units, weight, subtotal, valid };
  }

  function updateSummary() {
    const selected = selection();
    quantity.setCustomValidity(selected.valid || quantity.value === '' ? '' : 'Escribe una cantidad entera positiva dentro del rango admitido.');
    setText('#order-weight', selected.valid ? formatWeight(selected.weight) : '—');
    setText('#order-subtotal', !selected.valid ? '—' : selected.subtotal === null ? 'Precio por confirmar' : formatPrice(selected.subtotal));
    setText('#order-delivery', deliveryFee === null ? 'Cobertura y costo por confirmar' : deliveryText);
    setText('#offer-format', selected.item ? `${selected.item.name} · ${formatWeight(selected.item.weightGrams)}` : 'Acordamos el formato contigo');
    setText('#offer-price', selected.item && selected.item.priceCOP !== null ? `${formatPrice(selected.item.priceCOP)} / presentación` : 'Por confirmar');
    document.querySelector('.purchase-submit').firstChild.textContent = available && selected.item && selected.item.priceCOP !== null ? 'Preparar solicitud ' : 'Preparar consulta ';
  }

  function clearReview() {
    review.hidden = true;
    whatsappLink.hidden = true;
    whatsappLink.removeAttribute('href');
    message.value = '';
    copyStatus.textContent = '';
  }

  form.addEventListener('input', () => {
    municipality.setCustomValidity('');
    clearReview();
    updateSummary();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    municipality.setCustomValidity(text(municipality.value) ? '' : 'Escribe el municipio de entrega.');
    updateSummary();
    if (!form.reportValidity()) return;
    const selected = selection();
    if (!selected.valid) return;
    const purpose = form.elements.namedItem('purpose').value === 'restaurante' ? 'mi restaurante' : 'cocinar en casa';
    const location = text(municipality.value).replace(/\s+/g, ' ');
    const lines = [
      'Hola, Setas de la Peña.',
      `Me interesa el shiitake para ${purpose}.`,
      selected.item ? `Presentación solicitada: ${selected.item.name} (${formatWeight(selected.item.weightGrams)}).` : 'Presentación: por confirmar.',
      selected.item ? `Cantidad: ${count.format(selected.units)} ${selected.units === 1 ? 'presentación' : 'presentaciones'} (${formatWeight(selected.weight)} en total).` : `Cantidad solicitada: ${formatWeight(selected.weight)}.`,
      selected.subtotal === null ? 'Precio: por confirmar.' : `Subtotal del producto: ${formatPrice(selected.subtotal)} (sin envío).`,
      `Municipio de entrega: ${location}.`,
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
      setText('#contact-note', 'WhatsApp abrirá este mensaje para que lo revises y decidas enviarlo. El pedido se confirma con la respuesta de Setas de la Peña.');
    }
    review.hidden = false;
    review.focus({ preventScroll: true });
    review.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  document.querySelector('#copy-order').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(message.value);
      copyStatus.textContent = 'Mensaje copiado. Puedes pegarlo en tu conversación.';
    } catch {
      message.focus();
      message.select();
      copyStatus.textContent = 'Seleccionamos el mensaje. Cópialo con el menú de tu dispositivo o con Ctrl/Cmd + C.';
    }
  });
  updateSummary();
  form.hidden = false;
})();
