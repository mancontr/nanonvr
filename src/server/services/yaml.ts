import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { configDir } from 'src/config'
import { Camera } from 'src/types'

const defaultPath = path.join(configDir, 'nanonvr.yml')

const yamlSchema = z.object({
  cameras: z.optional(z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      snapshot: z.optional(z.string()),
      'stream-main': z.string(),
      'stream-sub': z.optional(z.string()),
    }).transform(cam => ({
      uuid: cam.id,
      name: cam.name,
      snapshot: cam.snapshot,
      streamMain: cam['stream-main'],
      streamSub: cam['stream-sub'],
    }))
  )),
  storage: z.optional(z.object({
    'max-percent': z.optional(z.number()),
  }).transform(s => ({
    maxPercent: s['max-percent']
  })))
})

type YamlSchemaType = z.input<typeof yamlSchema>
interface ConfigType {
  cameras?: Camera[]
  storage?: {
    maxPercent?: number
  }
}

// Zod provides the yml->data transform, but can't do the opposite by itself
const config2yaml = (cfg: ConfigType): YamlSchemaType => {
  const yml: YamlSchemaType = {}
  if (cfg.cameras) {
    yml.cameras = cfg.cameras.map(cam => ({
      id: cam.uuid,
      name: cam.name,
      snapshot: cam.snapshot || undefined,
      'stream-main': cam.streamMain,
      'stream-sub': cam.streamSub || undefined,
    }))
  }
  return yml
}

export class Config {
  config: ConfigType = {}

  load(altPath: string = defaultPath) {
    if (fs.existsSync(altPath)) {
      try {
        const data = fs.readFileSync(altPath, 'utf8')
        const newConfig: YamlSchemaType = YAML.parse(data)
        this.config = yamlSchema.parse(newConfig)
      } catch (e) {
        console.error('Could not load YML config:', e.message)
        console.warn(e)
      }
    }
  }

  save(altPath: string = defaultPath) {
    const yml = config2yaml(this.config)
    const ymlString = YAML.stringify(yml)
    fs.writeFileSync(altPath, ymlString)
  }

  getCameras(): Camera[] {
    return this.config.cameras || []
  }

  getCamera(id: string): Camera | undefined {
    return this.config.cameras?.find(c => c.uuid === id)
  }

  addCamera(camera: Camera): void {
    if (!this.config.cameras) this.config.cameras = []
    this.config.cameras.push({ ...camera, uuid: uuid() })
    this.save()
  }

  updateCamera(id: string, camera: Camera): void {
    if (!this.config.cameras) this.config.cameras = []
    const idx = this.config.cameras.findIndex(cam => cam.uuid === id)
    this.config.cameras[idx] = camera
    this.save()
  }

  removeCamera(id: string): void {
    if (!this.config.cameras) this.config.cameras = []
    const idx = this.config.cameras.findIndex(cam => cam.uuid === id)
    this.config.cameras.splice(idx, 1)
    this.save()
  }

  getStorageLimits() {
    return this.config.storage
  }

}

const config = new Config()
export default config
