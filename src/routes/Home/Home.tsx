import React, { useState } from 'react'
import Feeds from 'src/components/Feeds/Feeds'
import Timeline from 'src/components/Timeline/Timeline'
import { Track } from 'src/types'
// import { FormattedMessage } from 'react-intl'
import './Home.sass'

const Home = () => {
  const [track, setTrack] = useState<Track>()

  return (
    <main id="home">
      <Feeds track={track}/>
      <Timeline track={track} setTrack={setTrack} />
    </main>
  )
}

export default Home
