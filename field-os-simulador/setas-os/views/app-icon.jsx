// Iconos SVG de la aplicación.
// Parte de simulador-app: build.js concatena este archivo con los demás de
// jsx-sources.cjs en un solo ámbito y genera simulador-app.js. No se carga solo.

const AppIcon=({name,size=14,className='',style={},color='currentColor'})=>{
  const s={display:'inline-block',verticalAlign:'middle',flexShrink:0,...style};
  switch(name){
    case 'mail':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-10 6L2 7"/>
        </svg>
      );
    case 'print':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
      );
    case 'tag':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
          <path d="M7 7h.01"/>
        </svg>
      );
    case 'qr':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/>
        </svg>
      );
    case 'rocket':
    case 'launch':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
          <path d="M9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2"/>
          <path d="M12 15v5s3.03-.55 4.5-2c1.47-1.45 2-4.5 2-4.5"/>
        </svg>
      );
    case 'sprout':
    case 'harvest':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M7 20h10"/>
          <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
          <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.4 1.7-4.6-2.7.2-4.1 1.1-4.9 2z"/>
        </svg>
      );
    case 'pantry':
    case 'warehouse':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
          <path d="M6 18h12"/>
          <path d="M6 14h12"/>
          <path d="M6 10h12"/>
        </svg>
      );
    case 'temp':
    case 'thermometer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
          <path d="M12 9v5"/>
        </svg>
      );
    case 'camera':
    case 'scan':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
      );
    case 'alert':
    case 'warning':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      );
    case 'globe':
    case 'trace':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      );
    case 'sparkles':
    case 'wand':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/>
        </svg>
      );
    case 'check':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      );
    case 'close':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      );
    case 'droplet':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      );
    case 'wind':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
          <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
          <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
        </svg>
      );
    case 'clock':
    case 'history':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    case 'chevron-left':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      );
    case 'chevron-right':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      );
    case 'bolt':
    case 'zap':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'scale':
    case 'balance':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <line x1="12" y1="2" x2="12" y2="20"/>
          <path d="M5 7l7-3 7 3M5 7L2 14h6L5 7zM19 7l-3 7h6l-3-7zM8 21h8"/>
        </svg>
      );
    case 'mushroom':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z"/>
          <path d="M9 12v6a3 3 0 0 0 6 0v-6"/>
        </svg>
      );
    case 'flame':
    case 'fire':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M12 2c.75 3.75 4.5 6 4.5 10.5a7.5 7.5 0 0 1-15 0c0-4.5 3.75-6.75 4.5-10.5 1.5 3 3 4.5 6 0z"/>
        </svg>
      );
    case 'snowflake':
    case 'cold':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <line x1="12" y1="2" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="m4.93 4.93 14.14 14.14M19.07 4.93 4.93 19.07"/>
        </svg>
      );
    case 'box':
    case 'package':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M3 6.75L12 2.25l9 4.5v10.5l-9 4.5-9-4.5V6.75z"/>
          <path d="M3 6.75L12 11.25l9-4.5M12 11.25v10.5"/>
        </svg>
      );
    case 'target':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="5" y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
        </svg>
      );
    case 'clipboard':
    case 'task':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M15 2H9a1 1 0 0 0-1 1v2h8V3a1 1 0 0 0-1-1z"/>
          <path d="M7 5H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <line x1="8" y1="11" x2="16" y2="11"/>
          <line x1="8" y1="16" x2="14" y2="16"/>
        </svg>
      );
    case 'edit':
    case 'pencil':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 18.5 3 19.5l1-4L16.5 3.5z"/>
        </svg>
      );
    case 'cart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <circle cx="9" cy="20" r="1.5"/>
          <circle cx="18" cy="20" r="1.5"/>
          <path d="M2 3h3.5l2.2 10.5h11.8l2-7.5H6"/>
        </svg>
      );
    case 'lock':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <rect x="4" y="10" width="16" height="12" rx="2"/>
          <path d="M7 10V6a5 5 0 0 1 10 0v4"/>
        </svg>
      );
    case 'rotate':
    case 'refresh':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M2.5 3.5v5h5"/>
          <path d="M3.5 14a8.5 8.5 0 1 0 1.7-8.5L2.5 8.5"/>
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color === 'none' ? 'none' : 'currentColor'} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      );
    case 'chart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
          <line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
      );
    case 'info':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      );
    case 'file':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      );
    case 'radio':
    case 'antenna':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M4.93 19.07a10 10 0 0 1 0-14.14"/>
          <path d="M7.76 16.24a6 6 0 0 1 0-8.48"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M16.24 7.76a6 6 0 0 1 0 8.48"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      );
    case 'flask':
    case 'lab':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
          <path d="M8.5 2h7"/>
          <path d="M7 16h10"/>
        </svg>
      );
    case 'plug':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M12 22v-5"/>
          <path d="M9 8V2"/>
          <path d="M15 8V2"/>
          <path d="M18 8v5a6 6 0 0 1-12 0V8z"/>
        </svg>
      );
    case 'gear':
    case 'settings':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      );
    case 'wrench':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      );
    case 'wine':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M8 22h8"/>
          <path d="M12 15v7"/>
          <path d="M12 15a7 7 0 0 0 7-7V3H5v5a7 7 0 0 0 7 7Z"/>
        </svg>
      );
    case 'bowl':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <path d="M4 11h16a8 8 0 0 1-16 0z"/>
          <line x1="8" y1="19" x2="16" y2="19"/>
        </svg>
      );
    case 'search':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={s} aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      );
    default:
      return null;
  }
};
