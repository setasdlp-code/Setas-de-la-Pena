# Relatos ilustrados de especies

Goal: ampliar las tres fichas e ilustrar su relación con nombres y ecología.
Scope: tres HTML, species-editorial.css, assets/species-stories y este documento; sin JS, recetas, KB ni Setas OS.
Baseline: main 3b78ddd8; rama codex/species-illustrated-stories inicialmente limpia.
Owner: Codex, un agente. Mode: implement + verify + deliver.
Authority: continuación del flujo commit/push/PR/deploy autorizado; merge requiere aprobación humana.
Acceptance: fuentes, procedencia visible, imágenes cargadas y lectura responsive/impresión, exportación íntegra.

## Procedencia y evidencia

Las tres imágenes son originales contemporáneos generados con IA el 18 de noviembre de 2026. No son reproducciones antiguas ni láminas de identificación. Se conservan originales en generated_images del entorno y copias en assets/species-stories. La imagen de eryngii se corrigió para situar el cuerpo fructífero sobre el suelo. Su corte es conceptual y sin escala; la rama de shiitake no identifica una especie precisa y el adorno de melena es una interpretación, no vestuario documentado.

- Shiitake: Cornell y Clark, ya citados en la ficha, apoyan shii + take y el cultivo en madera. Tier 1/2, confianza alta para esos textos. Se añade MK&G, Mizoguchi Gekkō, Shiitake: Eine Übersicht (1872), inventario IE1899.76: https://www.mkg-hamburg.de/sammlung/objekt/shiitake-eine-ubersicht/IE1899.76/mkg-e00136966. Tier 2, catálogo institucional, confianza alta para técnica, fecha y motivos (shiitake, troncos, hojas). La ficha no ofrece reproducción digital disponible; se enlaza, sin reutilizar su imagen.
- Se encontró también Hyuga shiitake, Kuniyoshi, 1852 (British Museum 2008,3037.02138): Commons marca dominio público, pero la procedencia declara CC BY-NC-SA. No se reutiliza esa reproducción en la web comercial. No es prueba de la especie de árbol shii.
- Melena: Kew, MAFF y Japan Tourism Agency, ya citados, apoyan morfología, nombres y comparación con adornos yamabushi. Tier 2, confianza alta para esos datos; la imagen no demuestra consumo histórico o efectos sobre la meditación.
- Eryngii: Dai y colaboradores (2019), ya citado, apoya asociación con Apiaceae, Eryngium/Ferula y variedades. La ilustración esquemática no representa mediciones ni un protocolo de cultivo.


Evidence: fichas y bibliografías actuales, MK&G IE1899.76, pruebas check_public_species.cjs y exportador público.
GitHub: PR nuevo; sin issue. Stop when: fichas ilustradas comprobadas, PR listo y publicación HTTPS verificada.

Verificación: fichas fuente y exportadas, 15 disposiciones y seis recorridos por ejecución, sin errores de navegador; exportación, 84 comprobaciones sin errores. Las tres figuras móviles se revisaron visualmente.
Entrega del paquete: 60 comprobaciones sin errores; diff --check correcto. Paquete completo de 352 archivos.
