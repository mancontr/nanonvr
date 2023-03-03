import { init } from 'src/server/services/config'
// All other services MUST be imported, but
// they don't need to be initialised manually.
// They will wait for a signal on the bus to start working.
import 'src/server/services/cleanup'
import 'src/server/services/db'
import 'src/server/services/ffmpeg'
import 'src/server/services/fswatch'
import 'src/server/services/ftp'
import 'src/server/services/mqtt'

export const startup = async () => {
  await init()
}
