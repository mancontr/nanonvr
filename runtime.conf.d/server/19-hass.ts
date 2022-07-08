/*
 * When running as a Home Assistant add-on, we would like to use Ingress, so
 * the whole app will be served on a random subdirectory. To properly link to
 * our assets, we need to read this path from the `X-Ingress-Path` header.
 * We must also remember to use it when calling the API.
 */

export const serverMiddleware = (ctx, next) => {
  const ingress = ctx.request.headers['x-ingress-path']
  if (ingress) ctx.basename = ingress
  return next()
}
