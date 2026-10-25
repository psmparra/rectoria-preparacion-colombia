// Exportaciones PNG a partir de la marca vectorial aprobada.
const sharp=require('sharp');const path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 for(const [name,size] of [['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]){
   const inset=Math.round(size*.16),mark=await sharp(path.join(root,'assets/logo.svg')).resize(size-2*inset,size-2*inset).png().toBuffer();
   await sharp({create:{width:size,height:size,channels:4,background:'#fffdf9'}}).composite([{input:mark,left:inset,top:inset}]).png().toFile(path.join(root,'assets',name));
 }
})().catch(e=>{console.error(e);process.exit(1)});
