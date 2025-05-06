import fs from 'fs'
import path from 'path'
import { getSelfInfo } from 'src/server/services/hass'

declare const __WATCH__: boolean, __SSR__: boolean

interface HassAddonInfo {
  ingress_url: string
  // ... and many more
}

/*
 * When running as a Home Assistant add-on, we would like to use Ingress, so
 * the whole app will be served on a random subdirectory. To properly link to
 * our assets, we need to find out this subdirectory on boot, by calling the
 * Supervisor API.
 */

let hassInfo: HassAddonInfo = null
let index: string = null

export const startup = async () => {
  try {
    hassInfo = await getSelfInfo()

    // If build mode, generate a static index using the newly obtained basename
    if (!__WATCH__ && !__SSR__) index = genIndex()
  } catch (e) {
    // Ignore silently (not on HASS?)
  }
}

/*
 * On each request:
 *   - On build mode, send a static index and stop the middleware chain
 *   - On watch mode, set the basename and let others continue
 */
export const serverMiddleware = (req, res, next) => {
  if (index) {
    res.type('text/html')
    res.send(index)
    return
  } else {
    if (hassInfo) req.basename = hassInfo.ingress_url
    return next()
  }
}

const genIndex = () => {
  const basename = hassInfo.ingress_url
  const chunkspath = path.resolve('build', 'client', 'webpack-chunks.json')
  const chunks = JSON.parse(fs.readFileSync(chunkspath).toString()).entrypoints
  const styles = []
  const scripts = []
  for (const chunk of chunks) {
    const asset = chunk.name
    if (asset.endsWith('.js') && asset !== 'polyfills.js') {
      scripts.push(`<script src="${basename + asset}"></script>`)
    } else if (asset.endsWith('.css')) {
      styles.push(`<link rel="stylesheet" href="${basename + asset}" />`)
    }
  }
  const contents =
    '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<meta charset="utf-8" />' +
    styles.join('') +
    '</head>' +
    '<body>' +
    '<div id="root"></div>' +
    scripts.join('') +
    '</body>' +
    '</html>'
  return contents
}
