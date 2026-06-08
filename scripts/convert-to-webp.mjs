import sharp from 'sharp'
import { readdir, rename, unlink } from 'fs/promises'
import { join, extname, basename } from 'path'
import { existsSync } from 'fs'

const ASSETS_DIR = 'src/assets'
const QUALITY = 80

const files = await readdir(ASSETS_DIR)
const pngs = files.filter(f => extname(f).toLowerCase() === '.png')

for (const file of pngs) {
  const input = join(ASSETS_DIR, file)
  const webpName = file.replace(/\.png$/i, '.webp')
  const output = join(ASSETS_DIR, webpName)

  const { size: before } = (await import('fs')).statSync(input)

  await sharp(input)
    .webp({ quality: QUALITY })
    .toFile(output)

  const { size: after } = (await import('fs')).statSync(output)
  const pct = Math.round((1 - after / before) * 100)
  console.log(`${file}: ${Math.round(before/1024)}KB → ${Math.round(after/1024)}KB (−${pct}%)`)
}
