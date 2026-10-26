/* Run from any directory after installing sharp. No reference images are used. */
const path = require('node:path');
const fs = require('node:fs/promises');
const sharp = require('sharp');
const root = path.join(__dirname, '..', 'assets');

async function main() {
  const svg = await fs.readFile(path.join(root, 'icon.svg'));
  for (const [name, size] of [['apple-touch-icon.png',180], ['icon-192.png',192], ['icon-512.png',512], ['icon-1024.png',1024], ['favicon-32.png',32]]) {
    await sharp(svg, { density: 384 }).resize(size,size).flatten({ background:'#2869ff' }).png().toFile(path.join(root,name));
  }
  // All meaningful contours lie within the central maskable safe circle.
  const inner = await sharp(svg, {density:384}).resize(358,358).png().toBuffer();
  await sharp({create:{width:512,height:512,channels:3,background:'#2869ff'}})
    .composite([{input:inner,left:77,top:77}]).png().toFile(path.join(root,'icon-maskable-512.png'));
  console.log('Rendered six square, opaque PNG icons.');
}
main().catch(error => {console.error(error); process.exitCode=1;});
