import { RequestHandler } from 'express'
import path from 'path'
import fs from 'fs'
import { getConfig } from '../services/config'
import { filename2date, date2filename } from 'src/util/compactTracks'
import db from '../services/db'
import { streamRange } from '../services/ffmpeg'

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

  if (!getConfig().cameras.some(cam => cam.uuid === camId)) {
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

  const filename = `${camId}_${date2filename(start)}_${date2filename(end)}.mp4`.replace(/[: ]/g, '-')
  res.setHeader('Content-Type', 'video/mp4')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  const proc = streamRange(files)
  proc.stderr.on('data', msg => console.warn(`[download] ffmpeg: ${msg.toString()}`))
  proc.on('error', err => {
    console.error('[download] ffmpeg process error', err)
    if (!res.headersSent) res.status(500).end()
  })
  req.on('close', () => proc.kill())
  proc.stdout.pipe(res)
}
