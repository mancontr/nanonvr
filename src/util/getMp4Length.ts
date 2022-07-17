import fs from 'fs'

const knownTypes = new Set([
  'ftyp', 'moov', 'mvhd', 'trak', 'tkhd', 'mdia', 'mdhd', 'hdlr', 'minf',
  'moof', 'mfhd', 'traf', 'tfhd', 'tfdt', 'trun', 'mdat'
])

/**
 * Gets the length of a fragmented MP4 video, without invoking external libraries.
 *
 * This should be much faster than calling ffprobe, but it's just a quick&dirty
 * mp4 parser, which might not work with some valid MP4 files. It has been
 * tried with the ones we generate, and should work properly with those.
 * @param filename The video file
 * @returns The length in seconds
 */
function getMp4Length (filename: string): number {
  const file = fs.openSync(filename, 'r')
  const buffer = Buffer.alloc(1024)
  let pos = 0
  let length = 0
  let timescale = 12800
  let defaultDuration = 0
  while (fs.readSync(file, buffer, 0, 1024, pos)) {
    const size = buffer.readInt32BE(0)
    const type = buffer.toString('utf8', 4, 8)
    const next = buffer.toString('utf8', 12, 16)
    if (type === 'mdhd') {
      timescale = buffer.readUInt32BE(20)
      const duration = buffer.readUInt32BE(24)
      if (duration) return duration // No need to keep reading...
    }
    if (type === 'moof') {
      defaultDuration = 0 // Previous one no longer applies
    }
    if (type === 'tfhd') {
      const flags = buffer.readUInt32BE(8)
      let offset = 16
      if (flags & 0x01) offset += 8
      if (flags & 0x02) offset += 4
      if (flags & 0x08) {
        defaultDuration = buffer.readUInt32BE(offset)
      }
    }
    if (type === 'trun') {
      let offset = 16
      const flags = buffer.readUInt32BE(8)
      if (flags & 0x01) offset += 4
      if (flags & 0x04) offset += 4
      const entries = buffer.readUInt32BE(12)
      let trunLength = 0
      for (let i = 0; i < entries; i++) {
        const duration = flags & 0x100 ? buffer.readUInt32BE(offset + i * 8) : defaultDuration
        trunLength += duration
      }
      length += trunLength
    }
    if (knownTypes.has(next)) {
      pos += 8
    } else {
      pos += size
    }
  }
  return length / timescale
}

export default getMp4Length
