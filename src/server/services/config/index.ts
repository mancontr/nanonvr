/**
 * Config Service
 *
 * This service deals with everything related to config, including:
 *   - Reading and writing the YAML config file
 *   - Fetching the Home Assistant config, if running on HAOS
 */

import path from 'path'
import bus from '../bus'
import defaultConfig from './default'
import Yaml from './yaml'

let yaml: Yaml = null

export const init = async () => {
  if (yaml !== null) return // Was already loaded

  // Load config from disk
  const configFolder = defaultConfig.folders.config
  const ymlPath = path.join(configFolder, 'nanonvr.yml')
  yaml = new Yaml(ymlPath)

  // Notify everyone who was waiting for it
  bus.emit('configLoaded', yaml.getContents())
}

export const getConfig = () => yaml.getContents()
export const getConfigHandler = () => yaml
