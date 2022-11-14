import Router from 'koa-router'
import db from '../services/db'

export const getEvents: Router.IMiddleware = (ctx) => {
  const events = db.getEvents()
  ctx.body = events
}
