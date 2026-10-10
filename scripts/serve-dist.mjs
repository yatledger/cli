import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../dist/spa', import.meta.url))
const PORT = Number(process.env.PORT) || 9100

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
}

createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0])
  const file = normalize(join(ROOT, path))
  try {
    if (!file.startsWith(ROOT)) throw new Error('forbidden')
    const data = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    const data = await readFile(join(ROOT, 'index.html'))
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
  }
}).listen(PORT, () => console.log(`Serving dist/spa on http://localhost:${PORT}`))
