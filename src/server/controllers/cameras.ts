import { RequestHandler } from 'express'
import { Readable } from 'stream'
import { getConfig } from '../services/config'
import * as cameras from '../services/cameras'
import { Recorder } from '../services/ffmpeg'

export const getCameras: RequestHandler = (_, res) => {
  const cams = getConfig().cameras
  res.send(cams)
}

export const getCamera: RequestHandler = (req, res) => {
  const cam = getConfig().cameras.find(cam => cam.uuid === req.params.id)
  res.send(cam)
}

export const getCameraStatus: RequestHandler = (req, res) => {
  const rec = Recorder.get(req.params.id)
  if (rec) {
    res.send({
      status: rec.getStatus(),
      logs: rec.getLogs(),
    })
  } else {
    res.send({
      status: 'UNKNOWN',
      logs: []
    })
  }
}

export const recordStart: RequestHandler = (req, res) => {
  const rec = Recorder.get(req.params.id)
  rec.start()
  res.send({})
}

export const recordStop: RequestHandler = (req, res) => {
  const rec = Recorder.get(req.params.id)
  rec.stop()
  res.send({})
}

export const getThumb: RequestHandler = async (req, res) => {
  const cam = getConfig().cameras.find(cam => cam.uuid === req.params.id)
  if (!cam.snapshot) res.status(404).send({ error: 'Not Found' })

  const { username, password, origin, pathname, search } = new URL(cam.snapshot)
  const credentials = btoa(`${username}:${password}`)
  const url = origin + pathname + search

  const fres = await fetch(url, { headers: { 'Authorization': `Basic ${credentials}`}})
  res.type(fres.headers.get('Content-Type') || 'image/jpeg')
  Readable.fromWeb(fres.body as any).pipe(res)
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
