import { RequestHandler } from 'express'
import { Readable } from 'stream'
import { getConfig } from '../services/config'
import { getHlsUrl } from '../services/mediamtx'

const FILE_RE = /^[\w.-]+$/
const FORWARDED_HEADERS = ['content-type', 'cache-control']

/**
 * Proxies the live HLS stream of a camera from MediaMTX, so it can be reached
 * through our port only (ie: behind Home Assistant Ingress).
 * Query strings are kept, since low-latency HLS uses them for blocking requests.
 */
export const serveLive: RequestHandler = async (req, res) => {
  const { camId, file } = req.params
  if (!getConfig().cameras.some(cam => cam.uuid === camId) || !FILE_RE.test(file)) {
    res.status(404).send({ error: 'Not found' })
    return
  }

  const query = req.originalUrl.includes('?') ? req.originalUrl.substring(req.originalUrl.indexOf('?')) : ''
  const abort = new AbortController()
  res.on('close', () => abort.abort())
  try {
    const upstream = await fetch(getHlsUrl(camId, file, query), { signal: abort.signal })
    res.status(upstream.status)
    for (const header of FORWARDED_HEADERS) {
      const value = upstream.headers.get(header)
      if (value) res.setHeader(header, value)
    }
    if (!upstream.body) {
      res.end()
      return
    }
    Readable.fromWeb(upstream.body as any)
      .on('error', () => res.destroy())
      .pipe(res)
  } catch (e) {
    if (abort.signal.aborted) return
    console.warn('[live] Could not reach MediaMTX:', e.message)
    if (!res.headersSent) res.status(502).send({ error: 'Live view unavailable' })
  }
}
