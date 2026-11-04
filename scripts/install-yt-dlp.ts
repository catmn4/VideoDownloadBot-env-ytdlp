import { chmod, mkdir, rename } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const target = join(import.meta.dir, '..', 'bin', 'yt-dlp')
const force = process.env.FORCE_YTDLP_DOWNLOAD === '1'

if (process.platform !== 'linux') {
  console.error(`yt-dlp installer: unsupported platform ${process.platform}; install yt-dlp manually`)
  process.exit(1)
}

const asset =
  process.arch === 'x64' ? 'yt-dlp_linux' :
  process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : null

if (!asset) {
  console.error(`yt-dlp installer: unsupported architecture ${process.arch}`)
  process.exit(1)
}

if (!force && await Bun.file(target).exists()) {
  console.log(`yt-dlp is already installed at ${target}`)
  process.exit(0)
}

const url = process.env.YTDLP_DOWNLOAD_URL ||
  `https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/${asset}`
const temporary = `${target}.download-${process.pid}`

console.log(`Downloading the latest yt-dlp (${asset})...`)
const response = await fetch(url, { redirect: 'follow' })
if (!response.ok) {
  throw new Error(`yt-dlp download failed: ${response.status} ${response.statusText}`)
}

await mkdir(dirname(target), { recursive: true })
await Bun.write(temporary, response)
await chmod(temporary, 0o755)
await rename(temporary, target)
console.log(`yt-dlp installed at ${target}`)
