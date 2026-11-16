/**
 * MediaMTX Service
 *
 * Runs a single MediaMTX process that connects to every camera once, and:
 *   - Records each main stream as 60s fMP4 segments, directly on the final
 *     day folders (<video>/<camId>/<YYYY-MM-DD>/<YYYY-MM-DD HH-MM-SS-micros>.mp4)
 *   - Serves recordings through its playback server (proxied by our API)
 *   - Re-serves each camera locally over RTSP, so we can grab snapshots
 *     without opening new connections to the camera
 *   - Serves live views over HLS (proxied by our API), remuxing only the
 *     cameras someone is watching
 *
 * The config file is generated before each launch. Later changes are applied
 * through the MediaMTX API, so unchanged cameras are never interrupted.
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { ChildProcess, spawn } from 'child_process'
import { Camera, Config } from 'src/types'
import bus from './bus'
import { getConfig } from './config'

export type RecorderStatus = 'IDLE' | 'ACTIVE' | 'RESTARTING'

const BIN = process.env.MEDIAMTX_BIN || 'mediamtx'
const RTSP_PORT = parseInt(process.env.MEDIAMTX_RTSP_PORT) || 18554
const API_PORT = parseInt(process.env.MEDIAMTX_API_PORT) || 19997
const PLAYBACK_PORT = parseInt(process.env.MEDIAMTX_PLAYBACK_PORT) || 19996
const HLS_PORT = parseInt(process.env.MEDIAMTX_HLS_PORT) || 18888
const API = `http://127.0.0.1:${API_PORT}/v3`
const RESTART_DELAY = 5000
const MAX_LOG_LINES = 100

let proc: ChildProcess = null
let running = false
let initialized = false // Stale instances have been dealt with

// In dev mode, each rebuild loads a new copy of this module in the same process,
// without stopping the old one. Only the newest copy may run MediaMTX.
const ownerToken = Symbol('mediamtx-owner')
const isOwner = () => (globalThis as any).__nanonvrMediamtxOwner === ownerToken
let shuttingDown = false
const stopped = new Set<string>() // Cameras whose recording was manually stopped
const logs = new Map<string, string[]>()

// --- Config generation ---

const getConfPath = () => path.join(os.tmpdir(), 'nanonvr', 'mediamtx.yml')

const getRecordPath = (config: Config) =>
  path.join(path.resolve(config.folders.video), '%path', '%Y-%m-%d', '%Y-%m-%d %H-%M-%S-%f')

const getPathConf = (cam: Camera) => ({
  source: cam.streamMain,
  record: !stopped.has(cam.uuid),
})

const genConf = (config: Config) => ({
  logLevel: 'info',
  logDestinations: ['stdout'],

  // Everything is bound to localhost, and only we talk to it
  authMethod: 'internal',
  authInternalUsers: [{
    user: 'any',
    pass: '',
    ips: ['127.0.0.1', '::1'],
    permissions: [
      { action: 'read' },
      { action: 'playback' },
      { action: 'api' },
    ],
  }],

  api: true,
  apiAddress: `127.0.0.1:${API_PORT}`,
  playback: true,
  playbackAddress: `127.0.0.1:${PLAYBACK_PORT}`,
  rtsp: true,
  rtspTransports: ['tcp'],
  rtspAddress: `127.0.0.1:${RTSP_PORT}`,
  // Low-latency HLS, only while someone watches (no transcoding involved)
  hls: true,
  hlsAddress: `127.0.0.1:${HLS_PORT}`,
  hlsVariant: 'lowLatency',
  hlsAlwaysRemux: false,
  hlsMuxerCloseAfter: '60s',
  rtmp: false,
  webrtc: false,
  srt: false,
  moq: false,

  pathDefaults: {
    rtspTransport: 'tcp',
    record: false,
    recordPath: getRecordPath(config),
    recordFormat: 'fmp4',
    recordPartDuration: '1s',
    recordSegmentDuration: '60s',
    recordDeleteAfter: '0s', // Cleanup is our job
  },

  paths: Object.fromEntries(
    (config.cameras || []).map(cam => [cam.uuid, getPathConf(cam)])
  ),
})

const writeConf = (config: Config) => {
  const confPath = getConfPath()
  fs.mkdirSync(path.dirname(confPath), { recursive: true })
  // JSON is valid YAML
  fs.writeFileSync(confPath, JSON.stringify(genConf(config), null, 2))
  return confPath
}

// --- Process management ---

const launch = () => {
  if (proc || shuttingDown || !isOwner()) return
  const confPath = writeConf(getConfig())
  log(null, '*** MediaMTX starting...')
  proc = spawn(BIN, [confPath])
  running = true

  let pending = ''
  const onData = (chunk: Buffer) => {
    pending += chunk.toString()
    const lines = pending.split('\n')
    pending = lines.pop()
    lines.forEach(handleLogLine)
  }
  proc.stdout.on('data', onData)
  proc.stderr.on('data', onData)

  proc.on('error', err => {
    console.error(`[mediamtx] Could not run "${BIN}":`, err.message)
  })
  proc.on('close', code => {
    proc = null
    running = false
    log(null, `*** MediaMTX stopped (code ${code})`)
    if (!shuttingDown && isOwner()) setTimeout(launch, RESTART_DELAY)
  })
}

/**
 * Kills any MediaMTX left running with our config by a previous run (ie: if
 * we got killed with SIGKILL), since it would hold all the ports we need.
 * Uses /proc, so it does nothing on non-Linux systems.
 */
const killStale = async () => {
  const confPath = getConfPath()
  const pids: number[] = []
  try {
    for (const entry of fs.readdirSync('/proc')) {
      if (!/^\d+$/.test(entry) || +entry === process.pid) continue
      try {
        const args = fs.readFileSync(`/proc/${entry}/cmdline`, 'utf8').split('\0')
        if (path.basename(args[0]) === path.basename(BIN) && args.includes(confPath)) pids.push(+entry)
      } catch (e) {
        // Process already gone, or not ours to read
      }
    }
  } catch (e) {
    return // No /proc
  }
  if (!pids.length) return

  console.warn(`[mediamtx] Killing stale instances: ${pids.join(', ')}`)
  const isAlive = (pid: number) => {
    try { process.kill(pid, 0); return true } catch (e) { return false }
  }
  const signal = (sig: NodeJS.Signals) => pids.filter(isAlive).forEach(pid => {
    try { process.kill(pid, sig) } catch (e) { /* Already gone */ }
  })
  signal('SIGTERM')
  for (let i = 0; i < 50 && pids.some(isAlive); i++) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  signal('SIGKILL')
}

const init = async () => {
  (globalThis as any).__nanonvrMediamtxOwner = ownerToken
  await killStale() // Including the one from a previous copy of this module
  initialized = true
  launch()
}

const restart = () => {
  if (proc) proc.kill() // Will be relaunched on close
  else launch()
}

const shutdown = () => {
  shuttingDown = true
  proc?.kill()
}

process.on('exit', shutdown)
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    shutdown()
    process.kill(process.pid, signal)
  })
}

// --- Logs ---

const handleLogLine = (line: string) => {
  if (!line.trim()) return
  const match = line.match(/\[path ([^\]]+)\]/)
  if (match) {
    log(match[1], line)
  } else if (/ (ERR|WAR) /.test(line)) {
    console.warn('[mediamtx]', line)
  }
}

/**
 * Adds a line to a camera log, or to all of them if camId is null
 */
const log = (camId: string | null, msg: string) => {
  const ids = camId ? [camId] : (getConfig().cameras || []).map(c => c.uuid)
  for (const id of ids) {
    if (!logs.has(id)) logs.set(id, [])
    const lines = logs.get(id)
    lines.push(msg)
    if (lines.length > MAX_LOG_LINES) lines.shift()
  }
}

// --- API ---

const api = async (method: string, endpoint: string, body?: any) => {
  const res = await fetch(API + endpoint, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) {
    const err: any = new Error(`MediaMTX API ${method} ${endpoint}: ${res.status} ${await res.text()}`)
    err.status = res.status
    throw err
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

/**
 * Applies the current camera list to the running MediaMTX instance.
 * Paths whose config did not change are not restarted.
 */
const sync = async () => {
  if (!initialized) return // Will launch with the current config
  if (!running) return launch()
  const cameras = getConfig().cameras || []
  try {
    const current = await api('GET', '/config/paths/list?itemsPerPage=10000')
    const currentNames = new Set<string>((current?.items || []).map(p => p.name))
    const wanted = new Set(cameras.map(c => c.uuid))

    for (const name of currentNames) {
      if (!wanted.has(name)) await api('DELETE', `/config/paths/delete/${encodeURIComponent(name)}`)
    }
    for (const cam of cameras) {
      const op = currentNames.has(cam.uuid) ? 'patch' : 'add'
      const method = op === 'patch' ? 'PATCH' : 'POST'
      await api(method, `/config/paths/${op}/${encodeURIComponent(cam.uuid)}`, getPathConf(cam))
    }
  } catch (e) {
    // Should not happen, but a restart will apply the whole config anyway
    console.error('[mediamtx] Could not sync config, restarting:', e.message)
    restart()
  }
}

// --- Public interface ---

export const getStatus = async (camId: string): Promise<RecorderStatus> => {
  if (stopped.has(camId)) return 'IDLE'
  if (!running) return 'RESTARTING'
  try {
    const info = await api('GET', `/paths/get/${encodeURIComponent(camId)}`)
    return info?.ready ? 'ACTIVE' : 'RESTARTING'
  } catch (e) {
    return 'RESTARTING'
  }
}

export const getLogs = (camId: string): string[] => logs.get(camId) || []

export const startRecording = async (camId: string) => {
  stopped.delete(camId)
  log(camId, '*** Recording enabled')
  await sync()
}

export const stopRecording = async (camId: string) => {
  stopped.add(camId)
  log(camId, '*** Recording disabled')
  await sync()
}

/**
 * URL to read the live stream locally (it will not open a new camera connection)
 */
export const getRtspUrl = (camId: string) =>
  `rtsp://127.0.0.1:${RTSP_PORT}/${encodeURIComponent(camId)}`

/**
 * URL of a fMP4 stream starting at the given instant. It will stop on the
 * first discontinuity (ie: reconnection), or after the given duration.
 */
export const getPlaybackUrl = (camId: string, start: Date, durationSecs: number) => {
  const params = new URLSearchParams({
    path: camId,
    start: start.toISOString(),
    duration: String(durationSecs),
    format: 'fmp4',
  })
  return `http://127.0.0.1:${PLAYBACK_PORT}/get?${params}`
}

/**
 * URL of a file from the live HLS stream of a camera (ie: index.m3u8)
 */
export const getHlsUrl = (camId: string, file: string, query = '') =>
  `http://127.0.0.1:${HLS_PORT}/${encodeURIComponent(camId)}/${encodeURIComponent(file)}${query}`

bus.once('configLoaded', init)
bus.on('configUpdated', sync)
