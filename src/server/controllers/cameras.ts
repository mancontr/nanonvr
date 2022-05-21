import Router from 'koa-router'
import db from '../services/db'

export const getCameras: Router.IMiddleware = async (ctx) => {
  const cams = await db.getCameras()
  ctx.body = cams
}

export const addCamera: Router.IMiddleware = async (ctx) => {
  const { name, stream } = ctx.request.body
  const cam = await db.addCamera(name, stream)
  ctx.body = cam
}
