import path from 'path'
import SqliteDatabase from 'better-sqlite3'
import { v4 as uuid } from 'uuid'
import { Camera } from 'src/types'
import { dataDir } from 'src/config'

const defaultPath = path.join(dataDir, 'data.db')

export class Database {
  db: SqliteDatabase = null

  constructor(altPath: string = defaultPath) {
    this.db = new SqliteDatabase(altPath)
    this.initialize()
  }

  initialize() {
    this.db.prepare(`CREATE TABLE IF NOT EXISTS cam (
      uuid TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      streamMain TEXT NOT NULL,
      streamSub TEXT,
      snapshot TEXT
    )`).run()
  }

  getCameras(): Camera[] {
    return this.db.prepare('SELECT * FROM cam').all()
  }

  getCamera(id: string): Camera {
    return this.db.prepare('SELECT * FROM cam WHERE uuid = ?').get([id])
  }

  addCamera(cam: Camera): Camera {
    const id = uuid()
    this.db
      .prepare(`INSERT INTO cam(uuid, name, streamMain, streamSub, snapshot) values (?, ?, ?, ?, ?)`)
      .run([id, cam.name, cam.streamMain, cam.streamSub, cam.snapshot])
    return { ...cam, uuid: id }
  }

  updateCamera(id: string, cam: Camera): Camera {
    this.db
      .prepare(`UPDATE cam SET name = ?, streamMain = ?, streamSub = ?, snapshot = ? WHERE uuid = ?`)
      .run([cam.name, cam.streamMain, cam.streamSub, cam.snapshot, id])
    return { ...cam, uuid: id }
  }

  removeCamera(id: string): void {
    this.db
      .prepare('DELETE FROM cam WHERE uuid = ?')
      .run([id])
  }

}

const db = new Database()
export default db
