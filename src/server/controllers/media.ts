import { RequestHandler } from 'express'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { getConfig } from '../services/config'
import { filename2date, date2filename } from 'src/util/compactTracks'
import db from '../services/db'
import { generateRange } from '../services/ffmpeg'

export const serveTrack: RequestHandler = async (req, res) => {
  const { camId, track } = req.params
  const target = [camId, track.substring(0, 10), track].join('/')
  const filePath = path.join(getConfig().folders.video, target)
  res.sendFile(filePath)
}

export const serveEvent: RequestHandler = async (req, res) => {
  const { camId, event } = req.params
  const target = camId + '/events/' + event
  const filePath = path.join(getConfig().folders.video, target)
  res.sendFile(filePath)
}

export const serveDownload: RequestHandler = async (req, res) => {
  const { camId } = req.params
  const start = Number(req.query.start)
  const end = Number(req.query.end)

  const cam = getConfig().cameras.find(cam => cam.uuid === camId)
  if (!cam) {
    res.status(404).send({ error: 'Camera not found' })
    return
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    res.status(400).send({ error: 'Invalid start/end' })
    return
  }

  const videoFolder = getConfig().folders.video
  const fromFilename = date2filename(start - 90000)
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

  const controller = new AbortController()
  req.on('close', () => controller.abort())

  let generated = false
  try {
    await generateRange(files, tmpPath, { title: cam.name, creationTime: new Date(start).toISOString() }, controller.signal)
    generated = true
  } catch (err) {
    console.error('[download] ffmpeg failed to generate range', err)
  }

  if (!generated) {
    fs.unlink(tmpPath, () => {})
    if (!res.headersSent) res.status(500).send({ error: 'Failed to generate video' })
    return
  }

  const filename = `${cam.name} ${date2filename(start)}.mp4`
  res.download(tmpPath, filename, err => {
    if (err) console.error('[download] Error sending file', err)
    fs.unlink(tmpPath, () => {})
  })
}
