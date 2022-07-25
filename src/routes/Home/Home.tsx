import React, { useState } from 'react'
import Feeds from 'src/components/Feeds/Feeds'
import SnapsWrapper from 'src/components/Snaps/Snaps'
import Timeline from 'src/components/Timeline/Timeline'
import { PlayPoint } from 'src/types'
import './Home.sass'

const Home = () => {
  const [playPoint, setPlayPoint] = useState<PlayPoint>()

  return (
    <main id="home">
      {playPoint
        ? <Feeds playPoint={playPoint}/>
        : <SnapsWrapper />
      }
      <Timeline playPoint={playPoint} setPlayPoint={setPlayPoint} />
    </main>
  )
}

export default Home
