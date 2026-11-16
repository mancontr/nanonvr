import { RequestHandler } from 'express'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { Readable } from 'stream'
import { getConfig } from '../services/config'
import { filename2date, date2filename } from 'src/util/compactTracks'
import db from '../services/db'
import { startDownloadJob, getDownloadJob, consumeDownloadJob } from '../services/downloadJobs'
import { getPlaybackUrl } from '../services/mediamtx'
import { getMp4Info } from 'src/util/getMp4Length'

export const serveTrack: RequestHandler = async (req, res) => {
  const { camId, track } = req.params
  const target = [camId, track.substring(0, 10), track].join('/')
  const filePath = path.join(getConfig().folders.video, target)
  res.sendFile(filePath)
}

// Each stream is capped, so browsers never have to buffer huge amounts of
// data (they can't seek on it, so they keep everything)
const PLAYBACK_MAX_DURATION = 600

/**
 * Streams the recordings of a camera from a given instant (ms timestamp),
 * through the MediaMTX playback server. It will end on the next discontinuity.
 */
export const servePlayback: RequestHandler = async (req, res) => {
  const { camId } = req.params
  const start = Number(req.query.start)
  if (!getConfig().cameras.some(cam => cam.uuid === camId)) {
    res.status(404).send({ error: 'Camera not found' })
    return
  }
  if (!Number.isFinite(start) || start <= 0) {
    res.status(400).send({ error: 'Invalid start' })
    return
  }
  const duration = Math.min(Number(req.query.duration) || PLAYBACK_MAX_DURATION, PLAYBACK_MAX_DURATION)

  const abort = new AbortController()
  res.on('close', () => abort.abort())
  try {
    const upstream = await fetch(getPlaybackUrl(camId, new Date(start), duration), { signal: abort.signal })
    res.status(upstream.status)
    res.type(upstream.headers.get('Content-Type') || 'video/mp4')
    res.setHeader('Cache-Control', 'no-store')
    if (!upstream.body) {
      res.end()
      return
    }
    Readable.fromWeb(upstream.body as any)
      .on('error', () => res.destroy())
      .pipe(res)
  } catch (e) {
    if (abort.signal.aborted) return
    console.warn('[playback] Could not reach MediaMTX:', e.message)
    if (!res.headersSent) res.status(502).send({ error: 'Playback unavailable' })
  }
}

/**
 * Finds the keyframe at or before the given instant (ms timestamp) on the
 * MediaMTX recordings, and returns its exact time.
 *
 * Playback streams should start on a keyframe: otherwise, MediaMTX includes
 * the previous frames with a zero duration, which some browsers can't decode.
 */
export const getKeyframe: RequestHandler = async (req, res) => {
  const { camId } = req.params
  const ts = Number(req.query.ts)
  if (!getConfig().cameras.some(cam => cam.uuid === camId) || !Number.isFinite(ts)) {
    res.status(400).send({ error: 'Invalid request' })
    return
  }
  const segment = findSegmentAt(camId, ts)
  if (!segment) {
    res.send({ ts })
    return
  }
  const { keyframes } = await getMp4Info(segment.path)
  const offsetUs = ts * 1000 - segment.startUs
  const keyframeUs = keyframes.map(k => Math.floor(k * 1e6)).filter(k => k <= offsetUs).pop() ?? 0
  // Rounded down, so we never land after the keyframe itself
  res.send({ ts: Math.floor((segment.startUs + keyframeUs) / 1000) })
}

const SEGMENT_NAME_RE = /^(\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2})-(\d{6})\.mp4$/

/**
 * Finds the MediaMTX segment containing the given instant, by looking at the
 * files themselves, so it also works for the one being recorded right now.
 */
const findSegmentAt = (camId: string, ts: number): { path: string, startUs: number } | null => {
  const camFolder = path.join(getConfig().folders.video, camId)
  const days = new Set([date2filename(ts).substring(0, 10), date2filename(ts - 86400000).substring(0, 10)])
  let best: { path: string, startUs: number } = null
  for (const day of days) {
    const dayFolder = path.join(camFolder, day)
    if (!fs.existsSync(dayFolder)) continue
    for (const filename of fs.readdirSync(dayFolder)) {
      const match = filename.match(SEGMENT_NAME_RE)
      if (!match) continue
      const startUs = filename2date(match[1]) * 1000 + parseInt(match[2])
      if (startUs <= ts * 1000 && (!best || startUs > best.startUs)) {
        best = { path: path.join(dayFolder, filename), startUs }
      }
    }
  }
  return best
}

export const serveEvent: RequestHandler = async (req, res) => {
  const { camId, event } = req.params
  const target = camId + '/events/' + event
  const filePath = path.join(getConfig().folders.video, target)
  res.sendFile(filePath)
}

const FILENAME_DATE_RE = /^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}$/

export const startDownload: RequestHandler = async (req, res) => {
  const { camId } = req.params
  const startStr = String(req.query.start)
  const endStr = String(req.query.end)

  const cam = getConfig().cameras.find(cam => cam.uuid === camId)
  if (!cam) {
    res.status(404).send({ error: 'Camera not found' })
    return
  }
  if (!FILENAME_DATE_RE.test(startStr) || !FILENAME_DATE_RE.test(endStr)) {
    res.status(400).send({ error: 'Invalid start/end' })
    return
  }
  const start = filename2date(startStr)
  const end = filename2date(endStr)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    res.status(400).send({ error: 'Invalid start/end' })
    return
  }

  const videoFolder = getConfig().folders.video
  // Tracks are named by their start, so look back enough to find the one covering our start
  const lookback = Math.max(90, db.getMaxTrackLength(camId) + 30) * 1000
  const fromFilename = date2filename(start - lookback)
  const toFilename = date2filename(end)

  const overlapping = db.getTracksInRange(camId, fromFilename, toFilename)
    .map(track => {
      const trackStart = filename2date(track.filename)
      const trackEnd = trackStart + track.length * 1000
      const filePath = path.join(videoFolder, camId, track.filename.substring(0, 10), track.filename)
      return { filePath, trackStart, trackEnd }
    })
    .filter(({ trackStart, trackEnd }) => trackStart < end && trackEnd > start)

  const entries = []
  for (const entry of overlapping) {
    if (fs.existsSync(entry.filePath)) {
      entries.push(entry)
    } else {
      console.warn(`[download] Missing file, skipping: ${entry.filePath}`)
    }
  }

  if (!entries.length) {
    res.status(404).send({ error: 'No footage found for that range' })
    return
  }

  const files = entries.map(({ filePath, trackStart, trackEnd }, i) => ({
    path: filePath,
    inpoint: i === 0 && trackStart < start ? (start - trackStart) / 1000 : undefined,
    outpoint: i === entries.length - 1 && trackEnd > end ? (end - trackStart) / 1000 : undefined,
  }))

  const tmpDir = path.join(videoFolder, 'tmp')
  fs.mkdirSync(tmpDir, { recursive: true })
  const tmpPath = path.join(tmpDir, `download-${randomUUID()}.mp4`)
  const filename = `${date2filename(start)} ${cam.name}.mp4`

  const id = startDownloadJob(files, tmpPath, filename, { title: cam.name, creationTime: new Date(start).toISOString() })
  res.send({ id })
}

export const getDownloadStatus: RequestHandler = (req, res) => {
  const job = getDownloadJob(req.params.id)
  if (!job) {
    res.status(404).send({ error: 'Not found' })
    return
  }
  res.send({ status: job.status, error: job.error })
}

export const serveDownloadFile: RequestHandler = (req, res) => {
  const job = getDownloadJob(req.params.id)
  if (!job || job.status !== 'done') {
    res.status(404).send({ error: 'Not ready' })
    return
  }
  consumeDownloadJob(req.params.id)
  res.setHeader('Cache-Control', 'no-transform')
  res.download(job.filePath, job.filename, err => {
    if (err) console.error('[download] Error sending file', err)
    fs.unlink(job.filePath, () => {})
  })
}
