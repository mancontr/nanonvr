import Router from 'koa-router'
import db from '../services/db'

export const getCameras: Router.IMiddleware = (ctx) => {
  const cams = db.getCameras()
  ctx.body = cams
}

export const getCamera: Router.IMiddleware = (ctx) => {
  const cam = db.getCamera(ctx.params.id)
  ctx.body = cam
}

export const getThumb: Router.IMiddleware = async (ctx) => {
  const cam = db.getCamera(ctx.params.id)
  if (!cam.snapshot) ctx.throw(404, 'Not Found')
  const res = await fetch(cam.snapshot)
  ctx.type = res.headers.get('Content-Type') || 'image/jpeg'
  ctx.body = res.body
}

export const addCamera: Router.IMiddleware = (ctx) => {
  const cam = db.addCamera(ctx.request.body)
  ctx.body = cam
}

export const updateCamera: Router.IMiddleware = (ctx) => {
  const id = ctx.params.id
  const cam = db.updateCamera(id, ctx.request.body)
  ctx.body = cam
}

export const removeCamera: Router.IMiddleware = (ctx) => {
  const id = ctx.params.id
  db.removeCamera(id)
  ctx.body = { success: true }
}
