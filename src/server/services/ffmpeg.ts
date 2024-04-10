import { mkdirSync } from 'fs'
import path from 'path'
import { ChildProcess, spawn, exec } from 'child_process'
import { Camera, Config } from 'src/types'
import bus from './bus'
import { getConfig } from './config'

type RecorderStatus = 'IDLE' | 'ACTIVE' | 'RESTARTING'

export class Recorder {
  private static threads = new Map<string, Recorder>()
  private url: string
  private folder: string
  private title: string
  private status: RecorderStatus
  private output: string[]
  private process: ChildProcess
  private stopping: boolean

  static getIds() {
    return Array.from(Recorder.threads.keys())
  }

  static get(id: string) {
    return Recorder.threads.get(id)
  }

  static getOrCreate(config: Config, cam: Camera) {
    if (Recorder.threads.has(cam.uuid)) return Recorder.threads.get(cam.uuid)
    const newRecorder = new Recorder(config, cam)
    Recorder.threads.set(cam.uuid, newRecorder)
    return newRecorder
  }

  private constructor(config: Config, cam: Camera) {
    this.url = cam.streamMain
    this.folder = path.join(config.folders.video, cam.uuid, 'temp')
    this.title = cam.name
    this.status = 'IDLE'
    this.output = []
    this.process = null
    this.stopping = false
  }

  start() {
    if (this.status === 'ACTIVE') return
    this.log('*** Recording starting...')
    mkdirSync(this.folder, { recursive: true })
    this.status = 'ACTIVE'
    this.stopping = false
    this.process = spawn('ffmpeg', this.getParams())
    this.process.stdout.on('data', msg => this.log(msg.toString()))
    this.process.stderr.on('data', msg => this.log(msg.toString()))
    this.process.on('close', () => {
      this.log(`*** Recording stopped`)
      if (this.stopping) {
        this.status = 'IDLE'
      } else {
        this.status = 'RESTARTING'
        setTimeout(() => this.start(), 10000)
      }
    })
  }

  stop() {
    this.stopping = true
    this.process?.kill()
  }

  update(config: Config, cam: Camera) {
    const newFolder = path.join(config.folders.video, cam.uuid, 'temp')
    const changed = this.url !== cam.streamMain
      || this.folder !== newFolder
      || this.title !== cam.name

    if (changed) {
      this.url = cam.streamMain
      this.folder = newFolder
      this.title = cam.name
      if (this.status === 'ACTIVE') this.process?.kill() // Force a restart
    }
  }

  getStatus() {
    return this.status
  }

  getLogs() {
    return this.output
  }

  private log(msg: string) {
    this.output.push(msg)
    if (this.output.length > 100) this.output.shift()
  }

  private getParams() {
    const isRtsp = this.url.startsWith('rtsp:')
    return [
      '-hide_banner',
      '-loglevel', 'warning',
      '-timeout', '5000000',
      isRtsp && '-rtsp_transport', isRtsp && 'tcp',
      '-i', this.url,
      '-use_wallclock_as_timestamps', '1',
      '-an',
      '-vcodec', 'copy',
      '-f', 'segment',
      '-segment_format_options', 'movflags=+faststart',
      '-strftime', '1',
      '-segment_time', '60',
      '-segment_atclocktime', '1',
      '-reset_timestamps', '1',
      '-metadata', 'title=' + this.title,
      path.join(this.folder, '%Y-%m-%d %H-%M-%S.mp4')
    ].filter(x => x)
  }

}

const sync = async () => {
  const config = getConfig()
  const currIds = Recorder.getIds()

  // Stop any no-longer-needed recorder
  const camIds = new Set(config.cameras.map(c => c.uuid))
  const toStop = currIds.filter(id => !camIds.has(id))
  for (const id of toStop) Recorder.get(id).stop()

  // Start or update all others
  for (const cam of config.cameras) {
    const rec = Recorder.getOrCreate(config, cam)
    if (rec.getStatus() === 'ACTIVE') {
      rec.update(config, cam)
    } else {
      rec.start()
    }
  }
}

export const getVideoLength = async (file: string): Promise<number> => {
  const cmd = `ffprobe -show_entries format=duration -v quiet -of csv="p=0" "${file}"`
  const out: string = await new Promise((resolve, reject) =>
    exec(cmd, (err, text) => err ? reject(err) : resolve(text))
  )
  const secs = Math.round(parseFloat(out))
  return secs
}

bus.once('configLoaded', sync)
bus.on('configUpdated', sync)
