import { mkdirSync } from 'fs'
import path from 'path'
import { ChildProcess, spawn, exec } from 'child_process'
import yaml from './yaml'
import { Camera } from 'src/types'
import { dataDir } from 'src/config'

export interface FfmpegThreadInfo {
  process?: ChildProcess
  restart?: boolean
}

const threads = new Map<string, FfmpegThreadInfo>()

const getOrCreateThreadInfo = (id: string): FfmpegThreadInfo => {
  const oldInfo = threads.get(id)
  if (oldInfo) return oldInfo
  const newInfo = { restart: true }
  threads.set(id, newInfo)
  return newInfo
}

export const startRecordingCam = (cam: Camera) => {
  const info = getOrCreateThreadInfo(cam.uuid)
  if (info.process) return // Already running

  const folder = path.join(dataDir, cam.uuid)
  mkdirSync(folder, { recursive: true })

  const target = path.join(folder, '%Y-%m-%d %H-%M-%S.mp4')

  console.debug('* Recording started for', cam.name)

  const cmd = info.process = spawn('ffmpeg', [
    '-hide_banner',
    '-loglevel', 'error',
    // '-stimeout', '3000000',
    '-rtsp_transport', 'tcp',
    '-i', cam.streamMain,
    '-an',
    '-vcodec', 'copy',
    '-f', 'segment',
    '-segment_format_options', 'movflags=+empty_moov+separate_moof+frag_keyframe',
    '-strftime', '1',
    '-segment_time', '600',
    '-segment_atclocktime', '1',
    '-metadata', 'title=' + cam.name,
    target
  ])
  cmd.stdout.on('data', text => console.warn('[ffmpeg]', text.toString()))
  cmd.stderr.on('data', text => console.warn('[ffmpeg]', text.toString()))
  cmd.on('close', code => {
    console.log(`* Recording stopped for ${cam.name} (status=${code})`)
    info.process = null
    if (info.restart) {
      setTimeout(() => startRecordingCam(cam), 10000)
    }
  })
}

export const startRecordingAll = async () => {
  const cameras = yaml.getCameras()
  cameras.forEach(startRecordingCam)
}

export const getVideoLength = async (file: string): Promise<number> => {
  const cmd = `ffprobe -show_entries format=duration -v quiet -of csv="p=0" "${file}"`
  const out: string = await new Promise((resolve, reject) =>
    exec(cmd, (err, text) => err ? reject(err) : resolve(text))
  )
  const secs = Math.round(parseFloat(out))
  return secs
}
