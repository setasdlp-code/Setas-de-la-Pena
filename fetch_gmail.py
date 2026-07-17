#!/usr/bin/env python3
"""
fetch_gmail.py — Setas de la Peña
Usa IMAP + App Password (sin OAuth, sin Google Cloud).

Setup (una sola vez):
  1. myaccount.google.com → Seguridad → Verificación en 2 pasos → activa si no está
  2. myaccount.google.com → Seguridad → Contraseñas de aplicaciones
     → App: "Correo"  → Dispositivo: "Mac" → Generar
     → Copia las 16 letras (ej: abcd efgh ijkl mnop)
  3. Pégala abajo en APP_PASSWORD (sin espacios) o en variable de entorno GMAIL_APP_PASSWORD

Uso:
  python3 fetch_gmail.py
"""

import imaplib
import email
import email.header
import json
import os
import re
import sys
from datetime import datetime, timedelta

# ── Configuración ──────────────────────────────────────────────────────────────
GMAIL_USER  = 'spinzonsilva@gmail.com'
APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')  # o pégala aquí entre comillas
OUTPUT_FILE  = 'sdp_emails.json'
DAYS_BACK    = 90
MAX_PER_SENDER = 20

SENDERS = [
    ('homecenter.com.co',  'prov_homecenter',   'Homecenter'),
    ('mercadolibre.com',   'prov_mercadolibre', 'MercadoLibre'),
    ('mercadopago.com',    'prov_mercadolibre', 'MercadoLibre'),
    ('rappi.com',          'prov_rappi',        'Rappi'),
    ('rappimail.com',      'prov_rappi',        'Rappi'),
]

SUBJECT_KEYWORDS = ['pedido', 'orden', 'compra', 'factura', 'confirmaci', 'recibo', 'pago']

# ── Helpers ────────────────────────────────────────────────────────────────────
def decode_header_str(raw) -> str:
    parts = email.header.decode_header(raw or '')
    out = []
    for part, enc in parts:
        if isinstance(part, bytes):
            out.append(part.decode(enc or 'utf-8', errors='replace'))
        else:
            out.append(str(part))
    return ' '.join(out)


def extract_text(msg) -> str:
    text = ''
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            if ct == 'text/plain':
                charset = part.get_content_charset() or 'utf-8'
                try:
                    text += part.get_payload(decode=True).decode(charset, errors='replace') + '\n'
                except Exception:
                    pass
        if not text:
            for part in msg.walk():
                if part.get_content_type() == 'text/html':
                    charset = part.get_content_charset() or 'utf-8'
                    try:
                        html = part.get_payload(decode=True).decode(charset, errors='replace')
                        text += strip_html(html) + '\n'
                    except Exception:
                        pass
    else:
        charset = msg.get_content_charset() or 'utf-8'
        try:
            text = msg.get_payload(decode=True).decode(charset, errors='replace')
            if msg.get_content_type() == 'text/html':
                text = strip_html(text)
        except Exception:
            text = ''
    return text[:2500]


def strip_html(html: str) -> str:
    html = re.sub(r'<br\s*/?>', '\n', html, flags=re.I)
    html = re.sub(r'</p>', '\n', html, flags=re.I)
    html = re.sub(r'</tr>', '\n', html, flags=re.I)
    html = re.sub(r'</td>', ' | ', html, flags=re.I)
    html = re.sub(r'<[^>]+>', '', html)
    for ent, ch in [('&amp;','&'),('&lt;','<'),('&gt;','>'),('&nbsp;',' '),('&#39;',"'")]:
        html = html.replace(ent, ch)
    return re.sub(r'\n{3,}', '\n\n', html).strip()


def imap_date(days_back: int) -> str:
    d = datetime.today() - timedelta(days=days_back)
    return d.strftime('%d-%b-%Y')  # e.g. "15-Apr-2025"


def has_keyword(subject: str) -> bool:
    s = subject.lower()
    return any(k in s for k in SUBJECT_KEYWORDS)


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print("Setas de la Peña — Gmail IMAP Fetcher")
    print("─" * 42)

    # Get password
    pwd = APP_PASSWORD.strip()
    if not pwd:
        print("\nIngresa tu App Password de Gmail (16 caracteres, sin espacios):")
        print("  (myaccount.google.com → Seguridad → Contraseñas de aplicaciones)")
        pwd = input("App Password: ").strip().replace(' ', '')
        if len(pwd) < 16:
            print("✗ App Password inválida (debe tener 16 caracteres)")
            sys.exit(1)

    print(f"\nConectando a Gmail como {GMAIL_USER}...")
    try:
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login(GMAIL_USER, pwd)
    except imaplib.IMAP4.error as e:
        print(f"✗ Error de autenticación: {e}")
        print("  Verifica que el App Password sea correcto y que IMAP esté habilitado en Gmail.")
        print("  Gmail → Configuración → Ver todos los ajustes → Reenvío e IMAP → Habilitar IMAP")
        sys.exit(1)

    print("✓ Conectado\n")
    mail.select('inbox')

    since = imap_date(DAYS_BACK)
    emails = []
    seen_ids = set()

    for domain, prov_id, prov_nombre in SENDERS:
        print(f"Buscando desde {domain}...", end=' ')
        try:
            status, data = mail.search(
                None,
                f'(FROM "{domain}" SINCE "{since}")'
            )
            msg_ids = data[0].split() if data[0] else []
            # Process most recent first
            msg_ids = msg_ids[-MAX_PER_SENDER:][::-1]
            print(f"{len(msg_ids)} email(s)")

            for mid in msg_ids:
                if mid in seen_ids:
                    continue
                seen_ids.add(mid)

                try:
                    _, raw = mail.fetch(mid, '(RFC822)')
                    msg = email.message_from_bytes(raw[0][1])
                    subject = decode_header_str(msg.get('Subject', ''))
                    from_   = decode_header_str(msg.get('From', ''))
                    date_   = msg.get('Date', '')
                    body    = extract_text(msg)

                    # Filter by subject keywords
                    if not has_keyword(subject):
                        continue

                    # Parse date
                    try:
                        dt = email.utils.parsedate_to_datetime(date_)
                        fecha = dt.strftime('%Y-%m-%d')
                    except Exception:
                        fecha = datetime.today().strftime('%Y-%m-%d')

                    emails.append({
                        'id':           f'imap_{mid.decode()}_{domain.replace(".","_")}',
                        'from':         from_,
                        'subject':      subject,
                        'date':         fecha,
                        'body':         body,
                        'provider':     prov_id,
                        'providerName': prov_nombre,
                    })
                except Exception as e:
                    print(f"  ⚠ Error al leer mensaje {mid}: {e}")

        except Exception as e:
            print(f"  ⚠ Error buscando {domain}: {e}")

    mail.logout()

    print(f"\n✓ {len(emails)} email(s) con facturas encontrado(s)")

    output = {
        'generado': datetime.now().isoformat(),
        'cuenta':   GMAIL_USER,
        'emails':   emails,
    }
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✓ Guardado en {OUTPUT_FILE}")
    print(f"\nSiguiente paso:")
    print(f"  Abre captura-email.html → Pendientes → Importar JSON → selecciona {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
