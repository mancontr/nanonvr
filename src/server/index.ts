import Router from 'koa-router'
import koaBody from 'koa-body'
import koaRange from 'koa-range'
import * as cameras from './controllers/cameras'
import * as tracks from './controllers/tracks'
import * as events from './controllers/events'
import * as media from './controllers/media'

const router = new Router()

router.use(koaBody({ multipart: true }))
router.use(koaRange)

router.get('/api/cameras', cameras.getCameras)
router.get('/api/cameras/:id', cameras.getCamera)
router.get('/api/cameras/:id/status', cameras.getCameraStatus)
router.post('/api/cameras/:id/record/start', cameras.recordStart)
router.post('/api/cameras/:id/record/stop', cameras.recordStop)
router.get('/api/cameras/:id/snapshot', cameras.getThumb)
router.post('/api/cameras', cameras.addCamera)
router.put('/api/cameras/:id', cameras.updateCamera)
router.delete('/api/cameras/:id', cameras.removeCamera)

router.get('/api/cameras/:id/tracks', tracks.getTracks)

router.get('/api/events', events.getEvents)

router.get('/media/:camId/:track', media.serveTrack)
router.get('/media/:camId/events/:event', media.serveEvent)

router.all('/api/(.*)', ctx => {
  if (!ctx.body) ctx.throw(404, 'Not found')
})

export default router.routes()
