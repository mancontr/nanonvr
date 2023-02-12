import Router from 'koa-router'
import yaml from '../services/yaml'

export const getCameras: Router.IMiddleware = (ctx) => {
  const cams = yaml.getCameras()
  ctx.body = cams
}

export const getCamera: Router.IMiddleware = (ctx) => {
  const cam = yaml.getCamera(ctx.params.id)
  ctx.body = cam
}

export const getThumb: Router.IMiddleware = async (ctx) => {
  const cam = yaml.getCamera(ctx.params.id)
  if (!cam.snapshot) ctx.throw(404, 'Not Found')
  const res = await fetch(cam.snapshot)
  ctx.type = res.headers.get('Content-Type') || 'image/jpeg'
  ctx.body = res.body
}

export const addCamera: Router.IMiddleware = (ctx) => {
  const cam = yaml.addCamera(ctx.request.body)
  ctx.body = cam
}

export const updateCamera: Router.IMiddleware = (ctx) => {
  const id = ctx.params.id
  const cam = yaml.updateCamera(id, ctx.request.body)
  ctx.body = cam
}

export const removeCamera: Router.IMiddleware = (ctx) => {
  const id = ctx.params.id
  yaml.removeCamera(id)
  ctx.body = { success: true }
}
