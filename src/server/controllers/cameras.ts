import Router from 'koa-router'
import { getConfig } from '../services/config'
import * as cameras from '../services/cameras'
import { Recorder } from '../services/ffmpeg'

export const getCameras: Router.IMiddleware = (ctx) => {
  const cams = getConfig().cameras
  ctx.body = cams
}

export const getCamera: Router.IMiddleware = (ctx) => {
  const cam = getConfig().cameras.find(cam => cam.uuid === ctx.params.id)
  ctx.body = cam
}

export const getCameraStatus: Router.IMiddleware = (ctx) => {
  const rec = Recorder.get(ctx.params.id)
  if (rec) {
    ctx.body = {
      status: rec.getStatus(),
      logs: rec.getLogs(),
    }
  } else {
    ctx.body = {
      status: 'UNKNOWN',
      logs: []
    }
  }
}

export const recordStart: Router.IMiddleware = (ctx) => {
  const rec = Recorder.get(ctx.params.id)
  rec.start()
  ctx.body = {}
}

export const recordStop: Router.IMiddleware = (ctx) => {
  const rec = Recorder.get(ctx.params.id)
  rec.stop()
  ctx.body = {}
}

export const getThumb: Router.IMiddleware = async (ctx) => {
  const cam = getConfig().cameras.find(cam => cam.uuid === ctx.params.id)
  if (!cam.snapshot) ctx.throw(404, 'Not Found')
  const res = await fetch(cam.snapshot)
  ctx.type = res.headers.get('Content-Type') || 'image/jpeg'
  ctx.body = res.body
}

export const addCamera: Router.IMiddleware = (ctx) => {
  const cam = cameras.addCamera(ctx.request.body)
  ctx.body = cam
}

export const updateCamera: Router.IMiddleware = (ctx) => {
  const id = ctx.params.id
  const cam = cameras.updateCamera(id, ctx.request.body)
  ctx.body = cam
}

export const removeCamera: Router.IMiddleware = (ctx) => {
  const id = ctx.params.id
  cameras.removeCamera(id)
  ctx.body = { success: true }
}
