import fs from 'fs'
import YAML from 'yaml'
import { Config } from 'src/types'
import defaultConfig from './default'
import { cleanDefaults, mergeDefaults } from 'src/util/defaults'
import objectKeyTransform from 'src/util/objectKeyTransform'

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
        const newConfig: Config = yaml2config(YAML.parse(data))
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
    fs.writeFileSync(this.ymlPath, YAML.stringify(yml))
  }

  getContents(): Config {
    return this.config
  }

  setContents(config: Config) {
    this.config = config
  }

}

const config2yaml = objectKeyTransform(s => s === 'uuid' ? 'id' : s.replace(/([a-z])([A-Z])/g, (_, a, b) => a + '-' + b.toLowerCase()))
const yaml2config = objectKeyTransform(s => s === 'id' ? 'uuid' : s.replace(/-([a-z])/g, (_, up) => up.toUpperCase()))

export default Yaml
