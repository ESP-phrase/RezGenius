const sharp = require('sharp')
const path = require('path')

const PUBLIC = path.join(__dirname, '..', 'public')

async function convert(svgFile, jpgFile, width) {
  await sharp(path.join(PUBLIC, svgFile))
    .resize({ width })
    .jpeg({ quality: 95 })
    .toFile(path.join(PUBLIC, jpgFile))
  console.log(`✓ ${jpgFile} (${width}px wide)`)
}

;(async () => {
  // Full logo with text
  await convert('logo.svg', 'logo.jpg', 1600)
  await convert('logo.svg', 'logo@2x.jpg', 800)

  // Just the spark mark
  await convert('logo-mark.svg', 'logo-mark.jpg', 1024)
  await convert('logo-mark.svg', 'logo-mark@2x.jpg', 512)

  console.log('\nAll JPGs in /public folder.')
})().catch(err => { console.error(err); process.exit(1) })
