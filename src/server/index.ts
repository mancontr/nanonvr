import Router from 'koa-router'
import koaBody from 'koa-body'
import * as cameras from './controllers/cameras'
import * as ffmpeg from './services/ffmpeg'
import * as fswatch from './services/fswatch'

const router = new Router()

router.use(koaBody({ multipart: true }))

router.get('/api/cameras', cameras.getCameras)
router.post('/api/cameras', cameras.addCamera)

router.get('/api/(.*)', ctx => {
  if (!ctx.body) ctx.throw(404, 'Not found')
})

// --- Initialise other startup jobs ---

fswatch.start()
ffmpeg.startRecordingAll()

export default router.routes()
