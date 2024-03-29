import { promises as dns } from 'dns'
import fs from 'fs'
import net from 'net'
import path from 'path'
import db from './db'
import { sendEvent } from './mqtt'
import { getHaInfo } from './hass'
import { getConfig } from './config'
import bus from './bus'

let server: net.Server = null
let dataServer: net.Server = null

interface FtpState {
  socket: net.Socket
  user: string
  pwd: string
  filename: string
}

const settingsMapping = new Map<string, FtpState>()

let hostIp: string = null

const start = async () => {
  const config = getConfig()
  hostIp = config.ftp.host
  if (!hostIp) {
    // No host set; try getting it from HA
    try {
      const info = await getHaInfo()
      if (info?.internal_url) {
        const hostname = new URL(info.internal_url).hostname
        const resolved = await dns.lookup(hostname)
        hostIp = resolved.address
      }
    } catch (e) {
      // Ignore silently (not on HASS?)
    }
  }

  server = net.createServer(handleConnection)
  server.on('error', () => console.warn('[ftp]: Error listening on port', config.ftp.port))
  server.listen(config.ftp.port, '0.0.0.0')

  dataServer = net.createServer(handleDataConnection)
  dataServer.on('error', () => console.warn('[ftp]: Error listening on port', config.ftp.dataPort))
  dataServer.listen(config.ftp.dataPort, '0.0.0.0')
}

const handleConnection = (socket: net.Socket) => {
  const clientIp = socket.remoteAddress
  let buffer: string = ''
  const state: FtpState = {
    socket: socket,
    user: 'anonymous',
    pwd: '/',
    filename: '',
  }

  socket.setKeepAlive(true, 60000)

  socket.write('220 (nanoNVR)\r\n')

  socket.on('data', data => {
    const dataStr = buffer + data.toString()
    const lines = dataStr.split(/\r?\n/)
    const length = lines.length - 1
    for (let i = 0; i < length; i++) {
      socket.emit('line', lines[i])
    }
    buffer = lines[length] || ''
  })

  // Remove the client from the list when it leaves
  socket.on('end', () => {
    settingsMapping.delete(clientIp)
  })

  socket.on('line', line => {
    const words = line.split(' ')
    const verb = words[0]
    switch (verb) {
      case 'USER':
        socket.write('331 Ok.\r\n')
        state.user = words[1]
        break
      case 'PASS':
        socket.write('230 Ok.\r\n')
        break
      case 'NOOP':
        socket.write('200 NOOP ok.\r\n')
        break
      case 'MKD':
        socket.write('257 Ok.\r\n')
        break
      case 'CWD':
        socket.write('250 Ok.\r\n')
        state.pwd = path.join(state.pwd, words[1])
        break
      case 'PWD':
        socket.write(`257 "${state.pwd}" is the current directory\r\n`)
        break
      case 'TYPE':
        socket.write('200 Ok.\r\n')
        break
      case 'PASV':
        const dataPort = getConfig().ftp.dataPort
        const p1 = Math.floor(dataPort / 256)
        const p2 = dataPort % 256
        const ip = hostIp || socket.localAddress
        const target = ip.replace(/\./g, ',') + `,${p1},${p2}`
        socket.write(`227 Entering Passive Mode (${target}).\r\n`)
        break
      case 'STOR':
        socket.write('150 Ok to send data.\r\n')
        state.filename = words[1]
        settingsMapping.set(clientIp, state)
        break
      case 'QUIT':
        socket.write('221 Ok.\r\n')
        break
      default:
        socket.write('502 Command Not Implemented\r\n')
    }
  })
}

const handleDataConnection = (socket: net.Socket) => {
  const clientIp = socket.remoteAddress
  const ts = Date.now()
  let state: FtpState = null
  let buffer: Buffer = null

  socket.setKeepAlive(true, 60000)

  socket.on('data', (data) => {
    if (!state) {
      state = settingsMapping.get(clientIp)
      if (!state) {
        // We weren't expecting any data right now
        socket.destroy()
        return
      }
    }
    buffer = buffer ? Buffer.concat([buffer, data]) : data
  })

  socket.on('end', () => {
    if (state?.socket) {
      state.socket.write('226 Transfer complete.\r\n')
      handleFile(buffer, ts, clientIp, path.join(state.pwd, state.filename))
    }
    buffer = null
  })

}

const handleFile = (buffer: Buffer, ts: number, clientIp: string, filename: string) => {
  const config = getConfig()
  const camera = config.cameras.find(c => c.streamMain.includes(clientIp))
  if (!camera) {
    console.warn(`[ftp] Discarded file from unknown source: ${clientIp}:${filename}`)
    return
  }

  const folder = path.join(config.folders.video, camera.uuid, 'events')
  fs.mkdirSync(folder, { recursive: true })

  let ext = filename.substring(filename.lastIndexOf('.') + 1)
  if (ext.includes('/') || ext.length > 4 || !ext) ext = 'jpg'
  ext = ext.toLowerCase()

  const isVideo = ['mp4', 'mov', 'h264', 'avi', 'qt', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)

  const date = new Date(ts).toISOString()
    .replace(/[T.]/g, ' ')
    .replace(/[Z:\-]/g, '')
  const newExt = isVideo ? 'mp4' : 'jpg'
  const newName = date + '.' + newExt
  const destination = path.join(folder, newName)

  fs.writeFileSync(destination, buffer)
  db.addEvent(camera.uuid, {
    uuid: camera.uuid,
    filename: newName,
    filesize: buffer.byteLength,
    originalName: filename,
    isVideo: isVideo
  })
  sendEvent(camera.uuid)
  // console.log(`[ftp] Received file: ${clientIp}:${filename} ; saved at: ${destination}`)
}

bus.once('configLoaded', start)
