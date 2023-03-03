import fs from 'fs'
import YAML from 'yaml'
import { z } from 'zod'
import { Config } from 'src/types'
import defaultConfig from './default'
import { cleanDefaults, mergeDefaults } from 'src/util/defaults'

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

// Zod provides the yml->data transform, but can't do the opposite by itself
const config2yaml = (cfg: Config): YamlSchemaType => {
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

class Yaml {
  private ymlPath: string = null
  private config: Config = null

  constructor(ymlPath: string) {
    this.ymlPath = ymlPath
    this.config = defaultConfig
    this.load()
  }

  load() {
    if (fs.existsSync(this.ymlPath)) {
      try {
        const data = fs.readFileSync(this.ymlPath, 'utf8')
        const newConfigYaml: YamlSchemaType = YAML.parse(data)
        const newConfig: Config = yamlSchema.parse(newConfigYaml)
        this.config = mergeDefaults(newConfig, defaultConfig)
      } catch (e) {
        console.error('Could not load YML config:', e.message)
        console.warn(e)
      }
    }
  }

  save() {
    const cleanConfig: Config = cleanDefaults(this.config, defaultConfig)
    const yml = config2yaml(cleanConfig)
    const ymlString = YAML.stringify(yml)
    fs.writeFileSync(this.ymlPath, ymlString)
  }

  getContents(): Config {
    return this.config
  }

  setContents(config: Config) {
    this.config = config
  }

}

export default Yaml
