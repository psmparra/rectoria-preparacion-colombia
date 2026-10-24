"""Genera recursos locales a partir de paquetes oficiales de npm (sin CDN en ejecución)."""
import json
from pathlib import Path
import sys
import tarfile

root=Path(__file__).resolve().parents[1]
assets=root/'assets'
assets.mkdir(exist_ok=True)
with tarfile.open(sys.argv[1]) as archive:
    nodes=json.load(archive.extractfile('package/icon-nodes.json'))
    names=['layout-dashboard','notebook-pen','library','chart-no-axes-combined','rotate-ccw-clock','sparkles','rotate-ccw','arrow-up-right','moon','download','upload','sun']
    (root/'icons.js').write_text('window.RECTORIA_ICONS = '+json.dumps({name:nodes[name] for name in names})+';\n')
    (assets/'LICENSE-lucide.txt').write_bytes(archive.extractfile('package/LICENSE').read())
with tarfile.open(sys.argv[2]) as archive:
    (assets/'inter-latin.woff2').write_bytes(archive.extractfile('package/files/inter-latin-wght-normal.woff2').read())
    (assets/'LICENSE-inter.txt').write_bytes(archive.extractfile('package/LICENSE').read())
