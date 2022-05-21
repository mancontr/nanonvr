import chokidar from 'chokidar'
import { dataDir } from 'src/config'

export const start = () => {
  chokidar.watch(dataDir).on('add', (path) => {
    if (!path.endsWith('.mp4')) return // Only watch for videos
    console.log('File added:', path)
    // TODO: check if we have it on DB already, or needs to be updated
    // Remember that:
    //   - on startup, we have to check all files
    //   - on new file creation, only the new file and the previous one
  })
}
