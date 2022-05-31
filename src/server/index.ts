import Router from 'koa-router'
import koaBody from 'koa-body'
import * as cameras from './controllers/cameras'

const router = new Router()

router.use(koaBody({ multipart: true }))

router.get('/api/cameras', cameras.getCameras)
router.get('/api/cameras/:id', cameras.getCamera)
router.get('/api/cameras/:id/snapshot', cameras.getThumb)
router.post('/api/cameras', cameras.addCamera)
router.put('/api/cameras/:id', cameras.updateCamera)
router.delete('/api/cameras/:id', cameras.removeCamera)

router.all('/api/(.*)', ctx => {
  if (!ctx.body) ctx.throw(404, 'Not found')
})

export default router.routes()
