import sharp from 'sharp';
import fs from 'fs';

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Game-World%20Logo%20-DXg3futH75lpNTcWOfEiVVCLYr1Fff.png';
const outputPath = '/home/user/logo-transparent.png';

console.log('Fetching logo from blob...');
const response = await fetch(logoUrl);
const arrayBuffer = await response.arrayBuffer();
const inputBuffer = Buffer.from(arrayBuffer);
console.log('Downloaded', inputBuffer.length, 'bytes');

async function removeBg() {
  const image = sharp(inputBuffer);
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  const threshold = 240; // pixels near white
  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      pixels[i + 3] = 0; // set alpha to 0 (transparent)
    }
  }

  const outputBuffer = await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();

  // Write to local fs so we can verify, and also output base64 for piping back
  fs.writeFileSync(outputPath, outputBuffer);
  console.log(`Done! Transparent logo (${info.width}x${info.height}), ${outputBuffer.length} bytes`);
  console.log(`DATA_URL:data:image/png;base64,${outputBuffer.toString('base64')}`);
}

removeBg().catch(console.error);
