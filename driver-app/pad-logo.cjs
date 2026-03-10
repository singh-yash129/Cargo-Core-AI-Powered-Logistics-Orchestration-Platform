const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, 'src/assets/Cargo-core-driver.png');
  const resDir = path.join(__dirname, 'resources');

  console.log('Generating icon-foreground.png...');
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      {
        input: await sharp(inputPath).resize(800, 800, { fit: 'inside' }).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(resDir, 'icon-foreground.png'));

  console.log('Generating icon-background.png...');
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .png()
    .toFile(path.join(resDir, 'icon-background.png'));

  console.log('Generating icon.png...');
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      {
        input: await sharp(inputPath).resize(800, 800, { fit: 'inside' }).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(resDir, 'icon.png'));
    
  console.log('Generating splash.png...');
  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      {
        input: await sharp(inputPath).resize(1200, 1200, { fit: 'inside' }).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(resDir, 'splash.png'));

  console.log('Logo processing complete.');
}

processLogo().catch(console.error);
