import Router from 'koa-router'
import send from 'koa-send'
import { dataDir } from 'src/config'

export const serve: Router.IMiddleware = async (ctx) => {
  const { camId, track } = ctx.params
  const target = camId + '/' + track
  await send(ctx, target, { root: dataDir})
}
