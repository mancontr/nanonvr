import Router from 'koa-router'
import db from '../services/db'

export const getCameras: Router.IMiddleware = async (ctx) => {
  const cams = await db.getCameras()
  ctx.body = cams
}

export const getCamera: Router.IMiddleware = async (ctx) => {
  const cam = await db.getCamera(ctx.params.id)
  ctx.body = cam
}

export const getThumb: Router.IMiddleware = async (ctx) => {
  const cam = await db.getCamera(ctx.params.id)
  if (!cam.snapshot) ctx.throw(404, 'Not Found')
  const res = await fetch(cam.snapshot)
  ctx.type = res.headers.get('Content-Type') || 'image/jpeg'
  ctx.body = res.body
}

export const addCamera: Router.IMiddleware = async (ctx) => {
  const cam = await db.addCamera(ctx.request.body)
  ctx.body = cam
}

export const updateCamera: Router.IMiddleware = async (ctx) => {
  const id = ctx.params.id
  const cam = await db.updateCamera(id, ctx.request.body)
  ctx.body = cam
}

export const removeCamera: Router.IMiddleware = async (ctx) => {
  const id = ctx.params.id
  await db.removeCamera(id)
  ctx.body = { success: true }
}
