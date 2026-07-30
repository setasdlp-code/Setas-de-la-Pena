window.addEventListener('field-os:ready', () => {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    
(function(){
  // Tweaks locked to current values - no interactive panel
  const TWEAK_DEFAULTS=/*EDITMODE-BEGIN*/{
    "mainImage": 10,
    "heroTitleColor": "var(--line-1)",
    "heroSubColor": "var(--accent-blue-grey)",
    "heroEyebrowColor": "#8FA3AE",
    "heroLedeColor": "var(--ink-0)",
    "heroBg": "#F6F4EC",
    "ingredientsPanelLabel": "Ingredientes disponibles",
    "heroLedge": "Simulador de formulación de sustrato: construcción manual, análisis comparativo y optimización automática (grid search) de proporciones. Valida cada receta contra parámetros de especie: C:N, N%, EB, pH, humedad, costo\/kg y compatibilidad de ingredientes.",
    "accent": [
      "var(--accent-blue-grey)",
      "#3A4F5C"
    ],
    "speciesBandBg": "var(--paper-0)",
    "speciesBandText": "var(--ink-0)",
    "bridgeBg": "var(--paper-0)",
    "bridgeText": "#9C3F1F",
    "cardBg": "var(--paper-1)",
    "grain": true,
    "showHero": true,
    "buttonBg": "#C68F2C",
    "buttonText": "#F6F4EC",
    "buttonBgHover": "#B8614D",
    "buttonBorder": "#6D7C5A",
    "inputBorder": "#C4BAB2",
    "inputBg": "#F6F4EC",
    "inputFocusBorder": "#B8614D",
    "inputText": "var(--ink-0)",
    "textPrimary": "var(--ink-0)",
    "textSecondary": "var(--accent-blue-grey)",
    "textTertiary": "var(--ink-2)",
    "paperBg": "var(--paper-0)",
    "mossAccent": "#3D4A38",
    "coralAccent": "#B8614D",
    "coralAccentHover": "#9C3F1F",
    "ochreAccent": "#C68F2C",
    "gridBorder": "#E4DDD4",
    "chipBg": "#C68F2C",
    "chipBorder": "#3D4A38",
    "chipText": "#3D4A38",
    "speciesCardBg": "var(--paper-0)",
    "speciesCardBorder": "#F6F4EC",
    "speciesCardImgOpacity": 100,
    "speciesSelectedAccent": "var(--accent-blue-grey)",
    "heroLede": "Simulador de formulación de sustrato: construcción manual, análisis comparativo y optimización automática (grid search) de proporciones. Valida cada receta contra parámetros de especie: C:N, N%, EB, pH, humedad, costo\/kg y compatibilidad de ingredientes.",
    "bridgeBorder": "var(--ink-0)",
    "bridgeLabelBg": "rgba(255,255,255,0.15)",
    "bridgeLabelText": "Activo",
    "bridgeLabelColor": "var(--ink-0)",
    "bridgeParamCN": "C:N",
    "bridgeParamCNColor": "#3D4A38",
    "bridgeParamTemp": "Temp",
    "bridgeParamTempColor": "#B8614D",
    "bridgeParamEB": "EB base",
    "bridgeParamEBColor": "#C68F2C",
    "bridgeSpeciesName": "Pleurotus ostreatus",
    "bridgeSpeciesScientific": "Pleurotus ostreatus (Jacq.) P. Kumm.",
    "stepNumColor": "var(--ink-0)",
    "stepNumBg": "var(--paper-1)",
    "stepTitleColor": "var(--ink-0)",
    "sppInfoTextColor": "#4E4A46",
    "panelBg": "#F6F4EC",
    "panelBorder": "#4E4A46",
    "wrapBg": "#F6F4EC",
    "sectionBg": "var(--paper-0)",
    "tabBg": "#F6F4EC",
    "tabText": "#8B8682",
    "tabActiveBg": "#B8614D",
    "tabActiveText": "var(--paper-0)",
    "borderColor": "#C4BAB2",
    "borderColorLight": "var(--paper-0)",
    "shadowColor": "rgba(0,0,0,0.1)",
    "badgeBgSuccess": "#6B8E5A",
    "badgeBgWarning": "#C68F2C",
    "badgeBgError": "#B8614D",
    "badgeTextSuccess": "var(--paper-0)",
    "badgeTextWarning": "var(--paper-0)",
    "badgeTextError": "var(--paper-0)",
    "dividerColor": "var(--paper-0)",
    "linkColor": "#C68F2C",
    "linkColorHover": "#B8614D",
    "headerBg": "#FFFFFF",
    "headerText": "var(--ink-0)",
    "headerBorder": "var(--paper-0)",
    "panelTitleColor": "var(--ink-0)",
    "panelTitleSize": 24,
    "panelTitleFont": "var(--font-body)",
    "constructorBtnBg": "var(--ink-0)",
    "constructorBtnText": "var(--paper-0)",
    "constructorBtnBorder": "#6D7C5A",
    "comparatorBg": "#F6F4EC",
    "comparatorBorder": "var(--accent-blue-grey)",
    "comparatorText": "#3D4A38",
    "headerMarkText": "Setas de la Peña",
    "headerMarkColor": "#3D4A38",
    "headerMarkSize": 24,
    "headerRightText": "Simulador de recetas",
    "headerRightColor": "#3D4A38",
    "headerRightSize": 11
  }/*EDITMODE-END*/
  
  // Apply tweaks directly (vanilla JS)
  const r=document.documentElement;
  const t=TWEAK_DEFAULTS;
  r.style.setProperty('--hero-img-w',(280+t.mainImage*48)+'px');
  if(Array.isArray(t.accent)){
    r.style.setProperty('--coral-500',t.accent[0]);
    r.style.setProperty('--coral-700',t.accent[1]);
  }
  const heroTitle = document.querySelector('.hero-title');
  if(heroTitle) heroTitle.style.color = t.heroTitleColor;
  const heroSub = document.querySelector('.hero-sub');
  if(heroSub) heroSub.style.color = t.heroSubColor;
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  if(heroEyebrow) heroEyebrow.style.color = t.heroEyebrowColor;
  const hero = document.querySelector('.hero');
  if(hero) hero.style.background = t.heroBg;
  const topbar = document.querySelector('.topbar');
  if(topbar) topbar.style.background = t.headerBg;
  if(topbar) topbar.style.color = t.headerText;
  const headerMark = document.querySelector('.topbar-mark');
  if(headerMark) {
    headerMark.textContent = t.headerMarkText;
    headerMark.style.color = t.headerMarkColor;
    headerMark.style.fontSize = t.headerMarkSize + 'px';
  }
  const headerRight = document.querySelector('.topbar-right');
  if(headerRight) {
    headerRight.textContent = t.headerRightText;
    headerRight.style.color = t.headerRightColor;
    headerRight.style.fontSize = t.headerRightSize + 'px';
  }
  const panelTitles = document.querySelectorAll('.sec');
  panelTitles.forEach(el => {
    el.style.color = t.panelTitleColor;
    el.style.fontSize = t.panelTitleSize + 'px';
  });
  r.style.setProperty('--spp-band-bg',t.speciesBandBg);
  r.style.setProperty('--spp-band-text',t.speciesBandText);
  r.style.setProperty('--bridge-bg',t.bridgeBg);
  r.style.setProperty('--bridge-text',t.bridgeText);
  r.style.setProperty('--card-bg',t.cardBg);
  r.style.setProperty('--btn-bg',t.buttonBg);
  r.style.setProperty('--btn-text',t.buttonText);
  r.style.setProperty('--input-border',t.inputBorder);
  r.style.setProperty('--input-bg',t.inputBg);
  r.style.setProperty('--text-primary',t.textPrimary);
  r.style.setProperty('--text-secondary',t.textSecondary);
  r.style.setProperty('--paper-bg',t.paperBg);
  r.style.setProperty('--moss-accent',t.mossAccent);
  r.style.setProperty('--coral-accent',t.coralAccent);
  r.style.setProperty('--ochre-accent',t.ochreAccent);
  r.style.setProperty('--chip-bg',t.chipBg);
  r.style.setProperty('--spp-card-bg',t.speciesCardBg);
  r.style.setProperty('--spp-img-opacity',t.speciesCardImgOpacity/100);
  r.classList.toggle('no-grain',!t.grain);
  r.classList.toggle('hide-hero',!t.showHero);
  const ledeEl = document.querySelector('.hero-lede');
  if(ledeEl && t.heroLede) ledeEl.textContent = t.heroLede;
  if(ledeEl) ledeEl.style.color = t.heroLedeColor;
  const bridgeSciEl = document.querySelector('.bridge-sci');
  if(bridgeSciEl) bridgeSciEl.textContent = t.bridgeSpeciesScientific;
})();

  }));
}, { once: true });
