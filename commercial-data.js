'use strict';
// Datos públicos del negocio. Completar solo con información confirmada por Setas de la Peña.
// whatsapp: número internacional con + y código de país, sin enlace (ejemplo de formato: +57…).
// availability: 'pilot' (antes de la primera cosecha), 'unconfirmed', 'available' o 'unavailable'.
// Cualquier otro valor se trata como 'unconfirmed'.
// presentations: [{ id, name, weightGrams, priceCOP }]; priceCOP puede ser null.
// deliveryFeeCOP: null significa por confirmar; 0 significa entrega gratuita confirmada.
// Los valores vacíos mantienen el recorrido como consulta, sin prometer stock o precios.
window.SetasCommerce = {
  whatsapp: null,
  availability: 'pilot',
  availabilityNote: null,
  presentations: [],
  deliveryAreas: null,
  deliveryDays: null,
  deliveryFeeCOP: null,
  paymentMethods: null,
  batch: null,
  harvestDate: null
};
