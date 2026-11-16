import { RequestHandler } from 'express'
import { Readable } from 'stream'
import { getConfig } from '../services/config'
import * as cameras from '../services/cameras'
import * as mediamtx from '../services/mediamtx'
import { grabFrame } from '../services/ffmpeg'

export const getCameras: RequestHandler = (_, res) => {
  const cams = getConfig().cameras
  res.send(cams)
}

export const getCamera: RequestHandler = (req, res) => {
  const cam = getConfig().cameras.find(cam => cam.uuid === req.params.id)
  res.send(cam)
}

export const getCameraStatus: RequestHandler = async (req, res) => {
  const id = req.params.id
  if (!cameras.getCamera(id)) {
    res.send({ status: 'UNKNOWN', logs: [] })
    return
  }
  res.send({
    status: await mediamtx.getStatus(id),
    logs: mediamtx.getLogs(id),
  })
}

export const recordStart: RequestHandler = async (req, res) => {
  await mediamtx.startRecording(req.params.id)
  res.send({})
}

export const recordStop: RequestHandler = async (req, res) => {
  await mediamtx.stopRecording(req.params.id)
  res.send({})
}

// Snapshots are shared for a short while, so many viewers cost the same as one
const SNAPSHOT_TTL = 2000
const snapshots = new Map<string, { time: number, promise: Promise<Buffer> }>()

const getSnapshot = (camId: string): Promise<Buffer> => {
  const cached = snapshots.get(camId)
  // Pending ones (time = Infinity) are always shared
  if (cached && Date.now() - cached.time < SNAPSHOT_TTL) return cached.promise
  const entry = { time: Infinity, promise: grabFrame(mediamtx.getRtspUrl(camId)) }
  snapshots.set(camId, entry)
  entry.promise.then(
    () => { entry.time = Date.now() },
    () => { if (snapshots.get(camId) === entry) snapshots.delete(camId) }
  )
  return entry.promise
}

export const getThumb: RequestHandler = async (req, res) => {
  const cam = cameras.getCamera(req.params.id)
  if (!cam) {
    res.status(404).send({ error: 'Not Found' })
    return
  }

  // Preferred: a frame from the stream we are already receiving
  try {
    const jpeg = await getSnapshot(cam.uuid)
    res.type('image/jpeg').send(jpeg)
    return
  } catch (e) {
    if (!cam.snapshot) {
      res.status(503).send({ error: e.message })
      return
    }
  }

  // Fallback: ask the camera itself
  try {
    const { username, password, origin, pathname, search } = new URL(cam.snapshot)
    const credentials = btoa(`${username}:${password}`)
    const url = origin + pathname + search
    const fres = await fetch(url, { headers: { 'Authorization': `Basic ${credentials}`}})
    res.type(fres.headers.get('Content-Type') || 'image/jpeg')
    Readable.fromWeb(fres.body as any).pipe(res)
  } catch (e) {
    res.status(502).send({ error: e.message })
  }
}

export const addCamera: RequestHandler = (req, res) => {
  const cam = cameras.addCamera(req.body)
  res.send(cam)
}

export const updateCamera: RequestHandler = (req, res) => {
  const id = req.params.id
  const cam = cameras.updateCamera(id, req.body)
  res.send(cam)
}

export const removeCamera: RequestHandler = (req, res) => {
  const id = req.params.id
  cameras.removeCamera(id)
  res.send({ success: true })
}
