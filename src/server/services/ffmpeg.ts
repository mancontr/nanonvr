import { spawn } from 'child_process'

export interface ConcatEntry {
  path: string
  inpoint?: number
  outpoint?: number
}

export interface RangeMetadata {
  title?: string
  creationTime?: string
}

export const generateRange = (files: ConcatEntry[], outputPath: string, metadata: RangeMetadata = {}, signal?: AbortSignal): Promise<void> => {
  const list = files.map(f => {
    let entry = `file 'file:${f.path.replace(/'/g, "'\\''")}'`
    if (f.inpoint != null) entry += `\ninpoint ${f.inpoint}`
    if (f.outpoint != null) entry += `\noutpoint ${f.outpoint}`
    return entry
  }).join('\n')

  const metadataArgs = []
  if (metadata.title) metadataArgs.push('-metadata', `title=${metadata.title}`)
  if (metadata.creationTime) metadataArgs.push('-metadata', `creation_time=${metadata.creationTime}`)

  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'warning',
      '-f', 'concat',
      '-safe', '0',
      '-protocol_whitelist', 'file,pipe,crypto,data',
      '-i', 'pipe:0',
      '-c', 'copy',
      ...metadataArgs,
      '-movflags', '+faststart',
      '-f', 'mp4',
      outputPath
    ], { signal })
    let stderr = ''
    proc.stderr.on('data', msg => { stderr += msg.toString() })
    proc.on('error', reject)
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`)))
    proc.stdin.end(list)
  })
}

/**
 * Grabs a single frame from a stream, as a JPEG.
 * Only keyframes are decoded, which keeps CPU usage to a minimum.
 */
export const grabFrame = (url: string, timeoutMs = 10000): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      url.startsWith('rtsp:') && '-rtsp_transport', url.startsWith('rtsp:') && 'tcp',
      // Stream params are already known from the RTSP handshake, so skip
      // probing, which would otherwise wait for 5s of media
      '-allowed_media_types', 'video',
      '-analyzeduration', '0',
      '-probesize', '32k',
      '-skip_frame', 'nokey',
      '-i', url,
      '-an',
      '-frames:v', '1',
      '-q:v', '4',
      '-f', 'image2',
      '-c:v', 'mjpeg',
      'pipe:1',
    ].filter(x => x), { timeout: timeoutMs })
    const chunks: Buffer[] = []
    let stderr = ''
    proc.stdout.on('data', chunk => chunks.push(chunk))
    proc.stderr.on('data', msg => { stderr += msg.toString() })
    proc.on('error', reject)
    proc.on('close', code => {
      const out = Buffer.concat(chunks)
      if (code === 0 && out.length) resolve(out)
      else reject(new Error(`ffmpeg could not grab a frame (code ${code}): ${stderr.trim()}`))
    })
  })
