import Router from 'koa-router'
import send from 'koa-send'
import { dataDir } from 'src/config'

export const serveTrack: Router.IMiddleware = async (ctx) => {
  const { camId, track } = ctx.params
  const target = camId + '/' + track
  await send(ctx, target, { root: dataDir})
}

export const serveEvent: Router.IMiddleware = async (ctx) => {
  const { camId, event } = ctx.params
  const target = camId + '/events/' + event
  await send(ctx, target, { root: dataDir})
}
