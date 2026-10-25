from pathlib import Path

root = Path(__file__).resolve().parents[1]
def read(name):
    return (root / name).read_text(encoding='utf-8')

html = read('index.html')
css = read('styles.css') + read('experience.css')
icons = read('icons.js')
bank = read('bank.js')
core = read('core.js')
app = read('app.js')
enhancements = read('enhancements.js') + '\n' + read('experience.js')

body = '''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark"><title>Rectoría · Preparación</title>
<style>''' + css + '''</style>
</head>
<body>
<aside class="sidebar"><a class="brand" href="#inicio"><span class="brand-icon">R</span> rectoría<span class="dot">.</span></a><div class="eyebrow">ESPACIO DE PREPARACIÓN</div><nav aria-label="Navegación principal"><a href="#inicio">◫ <span>Mi preparación</span></a><a href="#practicar">▤ <span>Practicar</span></a><a href="#biblioteca">▧ <span>Mi biblioteca</span></a><a href="#resultados">◷ <span>Resultados</span></a><a href="#historial">↗ <span>Historial</span></a></nav><div class="sidebar-bottom"><div class="goal-small">UNA META, UN CAMINO.<p>El próximo capítulo de tu<br>liderazgo empieza aquí.</p></div><button id="theme" class="quiet">◐ Cambiar apariencia</button><button id="export" class="quiet">↓ Exportar mis datos</button><label class="quiet file-label">↑ Recuperar respaldo<input id="restore" type="file" accept="application/json,.json"></label></div></aside>
<div class="workspace"><header class="topbar"><span>Concurso de directivos docentes <span class="slash">/</span> <b>Rector</b></span><span class="local-badge">● Guardado en este dispositivo</span></header><main id="app" tabindex="-1"></main><footer>RECTORÍA · PREPARACIÓN CON PROPÓSITO <span>Tu progreso se queda contigo.</span></footer></div><div id="toast" role="status" aria-live="polite"></div>
<script>''' + icons + '''</script><script>''' + bank + '''</script><script>''' + core + '''</script><script>''' + app + '''</script><script>''' + enhancements + '''</script>
</body></html>'''
(root / 'rectoria-vscode.html').write_text(body, encoding='utf-8')
print(f'Generado rectoria-vscode.html ({len(body.encode())} bytes)')
