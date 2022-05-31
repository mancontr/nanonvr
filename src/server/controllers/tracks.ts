import Router from 'koa-router'
import db from '../services/db'

export const getTracks: Router.IMiddleware = (ctx) => {
  const cam = ctx.params.id
  const tracks = db.getTracks(cam)
  ctx.body = tracks
}
