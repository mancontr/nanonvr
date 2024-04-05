import Router from 'koa-router'
import send from 'koa-send'
import { getConfig } from '../services/config'

export const serveTrack: Router.IMiddleware = async (ctx) => {
  const { camId, track } = ctx.params
  const target = [camId, track.substring(0, 10), track].join('/')
  await send(ctx, target, { root: getConfig().folders.video })
}

export const serveEvent: Router.IMiddleware = async (ctx) => {
  const { camId, event } = ctx.params
  const target = camId + '/events/' + event
  await send(ctx, target, { root: getConfig().folders.video })
}
