import { EventEmitter } from 'events'
import { Config } from 'src/types'

interface BusEvents {
  configLoaded: (config: Config) => void
  configUpdated: (config: Config) => void
}

declare interface Bus {
  on<U extends keyof BusEvents>(event: U, listener: BusEvents[U]): this
  once<U extends keyof BusEvents>(event: U, listener: BusEvents[U]): this
  emit<U extends keyof BusEvents>(event: U, ...args: Parameters<BusEvents[U]>): boolean
}

/**
 * Event Bus to communicate the different parts of the server.
 */

class Bus extends EventEmitter {
  constructor() {
    super()
  }
}

const bus = new Bus()

export default bus
