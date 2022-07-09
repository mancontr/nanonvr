import path from 'path'
import SqliteDatabase from 'better-sqlite3'
import { v4 as uuid } from 'uuid'
import { Camera, Track } from 'src/types'
import { dbDir } from 'src/config'

const defaultPath = path.join(dbDir, 'data.db')

export class Database {
  db: SqliteDatabase = null

  constructor(altPath: string = defaultPath) {
    this.db = new SqliteDatabase(altPath)
  }

  initialize() {
    this.db.prepare(`CREATE TABLE IF NOT EXISTS cam (
      uuid TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      streamMain TEXT NOT NULL,
      streamSub TEXT,
      snapshot TEXT
    )`).run()

    this.db.prepare(`CREATE TABLE IF NOT EXISTS track (
      uuid TEXT NOT NULL REFERENCES cam(uuid),
      filename TEXT NOT NULL,
      filesize INTEGER NOT NULL,
      length INTEGER NOT NULL
    )`).run()
  }

  // --- Cameras ---

  getCameras(): Camera[] {
    return this.db
      .prepare('SELECT * FROM cam ORDER BY name')
      .all()
  }

  getCamera(id: string): Camera {
    return this.db
      .prepare('SELECT * FROM cam WHERE uuid = ?')
      .get([id])
  }

  addCamera(cam: Camera): Camera {
    const id = uuid()
    this.db
      .prepare('INSERT INTO cam(uuid, name, streamMain, streamSub, snapshot) values (?, ?, ?, ?, ?)')
      .run([id, cam.name, cam.streamMain, cam.streamSub, cam.snapshot])
    return { ...cam, uuid: id }
  }

  updateCamera(id: string, cam: Camera): Camera {
    this.db
      .prepare('UPDATE cam SET name = ?, streamMain = ?, streamSub = ?, snapshot = ? WHERE uuid = ?')
      .run([cam.name, cam.streamMain, cam.streamSub, cam.snapshot, id])
    return { ...cam, uuid: id }
  }

  removeCamera(id: string): void {
    this.db
      .prepare('DELETE FROM cam WHERE uuid = ?')
      .run([id])
  }

  // --- Tracks ---

  getTracks(camId: string): Track[] {
    return this.db
      .prepare('SELECT * FROM track WHERE uuid = ? ORDER BY filename DESC')
      .all([camId])
  }

  getTrack(camId: string, filename: string): Track {
    return this.db
      .prepare('SELECT * FROM track WHERE uuid = ? AND filename = ?')
      .get([camId, filename])
  }

  addTrack(camId: string, track: Track): Track {
    this.db
      .prepare('INSERT INTO track(uuid, filename, filesize, length) values (?, ?, ?, ?)')
      .run([camId, track.filename, track.filesize, track.length])
    return { ...track, uuid: camId }
  }

  updateTrack(camId: string, filename: string, track: Track): Track {
    this.db
      .prepare('UPDATE track SET filesize = ?, length = ? WHERE uuid = ? AND filename = ?')
      .run([track.filesize, track.length, camId, filename])
    return { ...track, uuid: camId, filename }
  }

  removeTrack(camId: string, filename: string): void {
    this.db
      .prepare('DELETE FROM track WHERE uuid = ? AND filename = ?')
      .run([camId, filename])
  }

}

const db = new Database()
export default db
