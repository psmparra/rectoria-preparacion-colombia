# Informe de controles e incidencias

## Controles superados

- Extracción de los dos PDF con Poppler; integridad documentada mediante SHA-256 en `bank.json`.
- Exactamente 140 ítems numerados del 1 al 140, sin números ni enunciados duplicados; 40 situaciones y 8 competencias, con los encabezados originales.
- Tres alternativas distintas por ítem y una clave válida. Coincidencia de las 140 claves detalladas con la tabla general del solucionario.
- Coincidencia textual de los 140 enunciados entre cuadernillo y solucionario, normalizando únicamente espacios y saltos de maquetación.
- Conservación de títulos, premisas, alternativas, explicaciones, análisis de distractores y base de referencia por caso. Las premisas se almacenan una vez y se muestran en un panel compartido durante la respuesta.
- Cinco pruebas automatizadas del núcleo: integridad, rechazo de datos malformados, calificación y pendientes, agregación por competencia y selección sin duplicados.
- Prueba de navegador real de examen, estudio y refuerzo; retroalimentación, marcas, salto y regreso, persistencia tras recarga, resultados e historial, exportación y restauración.
- Extensiones de 20, 40, 70 y 140 ejecutadas y comprobadas en navegador.
- Capturas de inicio, selector, examen, retroalimentación, resultados, historial y biblioteca a 1440 px y 390 px; control automático de desbordamiento horizontal. Apariencias clara y oscura revisadas.
- Navegación y práctica probadas sin red después de la carga inicial. Recursos locales: sin CDN ni servicios externos.

## Incidencias y límites académicos

No se detectaron discrepancias de numeración, enunciados ni claves entre los PDF. Esto comprueba correspondencia documental, no equivale a validar jurídicamente las respuestas.

1. **Vigencia normativa pendiente (ítems 1–140).** Se conserva la base original de cada caso. No se ha hecho una revisión jurídica externa de las normas, las funciones citadas ni el anexo técnico. No se modificó ninguna clave. La propia portada del solucionario pide confrontar las referencias con el texto vigente y la convocatoria oficial.
2. **No es un banco oficial (ítems 1–140).** El material declara que sus ítems son de elaboración original para entrenamiento. El porcentaje simple no se convierte a puntaje oficial ni garantiza superar el concurso. La aplicación informa este alcance en la biblioteca.
3. **Calificación y meta.** 126/140 equivale exactamente a 90 %; para superarlo se necesitan 127 aciertos. La meta inicial de la aplicación es 91 %, que requiere 128/140 para alcanzarla (127/140 es aproximadamente 90,71 %). La meta es configurable.
4. **Documento complementario no recibido.** No se pudo examinar `Super_NEXO_v15.2.txt`. Se aplicaron los principios editoriales explícitos del encargo, sin atribuir a ese archivo contenido no leído.
5. **Normalización de formato.** El extractor transforma saltos de renglón y espacios de maquetación en espacios simples; no conserva la disposición tipográfica del PDF. Los originales se incluyen en `sources` para cotejo.

## Límites técnicos de la verificación

- El navegador administrado del entorno devuelve `ERR_BLOCKED_BY_ADMINISTRATOR` al abrir `file://`. No se pudo comprobar aquí esa apertura directa. La aplicación utiliza scripts clásicos y archivos relativos, sin `fetch`, módulos ni servidor obligatorio. Se entregan la carpeta y un ZIP para abrirla en un navegador local.
- WCAG 2.2 AA es un objetivo de implementación: etiquetas, foco visible, navegación por teclado, semántica nativa, avisos accesibles y movimiento reducido están incorporados. No se realizó una certificación completa con lectores de pantalla o dispositivos físicos.
- Persistencia comprobada en Chromium; los permisos de almacenamiento de cada navegador pueden variar. Se ofrecen respaldos exportables. No existe sincronización automática entre dispositivos.
- Las sesiones de prueba usan un perfil temporal independiente; el producto se entrega sin resultados ni respuestas precargadas.
