"""Empaqueta los archivos necesarios para uso offline, excluyendo pruebas y datos Git."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root=Path(__file__).resolve().parents[1]
names=['index.html','styles.css','app.js','core.js','enhancements.js','icons.js','bank.js','bank.json','README.md','AUDITORIA.md']
with ZipFile(root/'Rectoria-offline.zip','w',ZIP_DEFLATED) as archive:
    for name in names:
        archive.write(root/name,name)
    for folder in ['assets','sources']:
        for item in sorted((root/folder).rglob('*')):
            if item.is_file():
                archive.write(item,item.relative_to(root))
print('Rectoria-offline.zip generado')
