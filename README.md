# Rectoría · preparación para el concurso

Tiempo de las sesiones nuevas (todas las modalidades): 20 preguntas, 34 min 17 s; 40, 1 h 8 min 34 s; 70, 2 h; 140, 4 h. Los límites proporcionales se redondean al segundo más cercano y se calculan con la cantidad real de ítems. La cuenta regresiva continúa al cerrar la app. Al volver después del vencimiento, se registra la finalización con las respuestas guardadas y el instante exacto del límite. Las sesiones antiguas iniciadas antes de esta actualización conservan el reloj anterior para evitar cierres inesperados. Los intentos ya finalizados no cambian.

Identidad visual: marca «Progreso ascendente», con tres planos que evocan páginas y una flecha, en morado y grafito. Incluye SVG escalable, favicon e íconos PNG para pantalla de inicio. En iPhone: abre la app en Safari, toca **Compartir → Añadir a pantalla de inicio**. Si ya tenías un acceso anterior, puedes volver a añadirlo para renovar su ícono. La marca también está incorporada dentro del HTML autocontenido.

La nueva interfaz incluye inicio personalizado con acceso directo a 20 preguntas, avance del ciclo, racha y resumen de los últimos siete días. Cambia entre Mao y Nata con **Cambiar perfil**, en la parte superior. Durante una prueba, abre **Ver recorrido y finalizar sesión** para saltar a un ítem o terminar. La biblioteca añade **Sin practicar**; las vistas previas no consumen preguntas del ciclo. Resultados muestra aciertos, errores, pendientes, tiempo y comparación orientativa con el intento anterior. El tiempo incluye pausas desde el inicio de la sesión.

Los logros se calculan a partir de tus sesiones reales; no hay resultados de demostración. Las preguntas, claves y explicaciones originales se conservan. Validación de interfaz: `node tests/experience.cjs` (servidor en 8017).

Actualización: banco de **560 preguntas** de cuatro simulacros originales. Cada perfil (Mao y Nata) tiene un ciclo independiente sin repeticiones en examen y estudio. La pantalla de práctica informa cuántas preguntas nuevas quedan. Al agotar el banco, se solicita confirmación para otro ciclo y se conserva el historial. El refuerzo puede repetir errores. Los primeros 140 identificadores se conservan para mantener compatibles los intentos anteriores.

La selección aleatoria no separa ni ordena por competencia. Los tres nuevos PDF carecen de clasificación por ítem: en resultados se indica esa ausencia expresamente. Los originales completos se incluyen en `sources`.

Validación de esta actualización: `node tests/expanded.cjs`, con el servidor local en el puerto 8017 y Playwright/Chromium disponibles.

## Abrir y estudiar

Descomprime `Rectoria-offline.zip` en una carpeta y abre **index.html** en Chrome, Edge, Firefox o Safari. Conserva juntos todos los archivos y la carpeta `assets`. No requiere instalación, cuenta ni conexión a Internet. En teléfonos, algunos gestores de archivos restringen la ejecución de HTML local: en ese caso, usa un navegador que permita abrir archivos o sirve la carpeta desde un equipo de tu red.

1. En **Practicar**, elige examen, estudio guiado o refuerzo y una extensión de 20, 40, 70 o 140 preguntas. El examen mezcla aleatoriamente todo el banco, como la prueba real. Las competencias se usan únicamente para analizar tus resultados.
2. Responde, marca preguntas o sáltalas. El panel de recorrido permite regresar. En estudio y refuerzo, pulsa **Comprobar respuesta** para ver la explicación original y desplegar los distractores y la referencia normativa.
3. Finaliza para registrar el resultado; las pendientes cuentan como no acertadas. La calificación es `aciertos / total × 100`, sin penalización adicional. Es un porcentaje diagnóstico, no un puntaje oficial CNSC.
4. Revisa resultados, historial y biblioteca. La meta inicial es 91 %, configurable. Superar 90 % en el examen de 140 exige al menos 127 aciertos.
5. Exporta respaldos periódicamente desde el lateral o **Ajustes** en móvil. El respaldo contiene el banco y tu progreso; puedes recuperarlo en otro navegador. El resultado individual también puede exportarse como JSON.

El guardado es local, asociado al navegador y al origen o ruta de apertura. Cambiar de navegador, borrar los datos, usar navegación privada o mover la carpeta puede afectar su disponibilidad. La aplicación avisa si no puede guardar. No hay sincronización ni envío de información. El temporizador mide tiempo real desde el inicio, incluso si cierras la ventana.

## Material y fidelidad

Se incorporaron íntegramente los 140 ítems y 40 casos de `Simulacro_Rector_2026_140_Preguntas.pdf`, junto con las claves, explicaciones, distractores y bases de referencia de `Solucionario_Rector_140.pdf`. `bank.json` y `bank.js` contienen los datos separados del código. Los saltos de línea debidos a la maquetación se normalizaron a espacios; no se reformularon preguntas ni alternativas. Los títulos y premisas se conservan como situaciones compartidas.

Consulta **AUDITORIA.md** para conocer los controles y limitaciones. Los PDF identifican el material como entrenamiento original, no como preguntas oficiales. Sus normas se reproducen sin afirmar vigencia comprobada. El documento complementario de calidad mencionado en el encargo no se recibió.

## Desarrollo y comprobaciones

La aplicación usa JavaScript, HTML y CSS sin compilación. Inter y los iconos Lucide están incluidos localmente con sus licencias. No utiliza CDN, analítica ni API.

```sh
node --test tests/core.test.js
python3 -m http.server 8011 --bind 127.0.0.1
# En otra terminal, con Playwright instalado y Chromium disponible:
node tests/browser.cjs
```

`CHROMIUM_PATH` permite indicar otro ejecutable. Las capturas y el respaldo de prueba se generan en `/tmp/rectoria-checks`. Para reproducir el cotejo del material, con Poppler instalado:

```sh
python3 tools/extract_bank.py /ruta/Simulacro_Rector_2026_140_Preguntas.pdf /ruta/Solucionario_Rector_140.pdf
```

El extractor exige 140 claves coincidentes en la tabla general y el detalle, enunciados coincidentes entre ambos PDF, tres alternativas por ítem y la secuencia completa 1–140. Regenera únicamente los archivos de datos. Sus hashes SHA-256 quedan registrados en el banco.
