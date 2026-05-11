const sharp = require('sharp')
const path = require('path')

const PUBLIC = path.join(__dirname, '..', 'public')

async function convert(svgFile, jpgFile, width) {
  await sharp(path.join(PUBLIC, svgFile))
    .resize({ width })
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(path.join(PUBLIC, jpgFile))
  console.log(`✓ ${jpgFile} (${width}px wide)`)
}

;(async () => {
  // Original simple logo
  await convert('logo.svg', 'logo.jpg', 1600)
  await convert('logo.svg', 'logo@2x.jpg', 800)
  await convert('logo-mark.svg', 'logo-mark.jpg', 1024)
  await convert('logo-mark.svg', 'logo-mark@2x.jpg', 512)

  // New polished v2 mark
  await convert('logo-mark-v2.svg', 'logo-mark-v2.jpg', 1024)

  // FB-ready: square 1:1 for ads + profile (1080x1080)
  await convert('logo-square-dark.svg', 'logo-square-dark.jpg', 1080)
  await convert('logo-square-light.svg', 'logo-square-light.jpg', 1080)

  // Horizontal 3:1 for ad headers (1200x400)
  await convert('logo-horizontal-dark.svg', 'logo-horizontal-dark.jpg', 1200)
  await convert('logo-horizontal-light.svg', 'logo-horizontal-light.jpg', 1200)

  // Avatar / favicon (square mark only, 512x512)
  await convert('logo-avatar.svg', 'logo-avatar.jpg', 512)
  await convert('logo-avatar.svg', 'logo-avatar-1024.jpg', 1024)

  console.log('\nAll JPGs in /public folder.')
})().catch(err => { console.error(err); process.exit(1) })
