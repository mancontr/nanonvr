import React, { useState } from 'react'
import Feeds from 'src/components/Feeds/Feeds'
import Timeline from 'src/components/Timeline/Timeline'
import { PlayPoint } from 'src/types'
// import { FormattedMessage } from 'react-intl'
import './Home.sass'

const Home = () => {
  const [playPoint, setPlayPoint] = useState<PlayPoint>()

  return (
    <main id="home">
      <Feeds playPoint={playPoint}/>
      <Timeline playPoint={playPoint} setPlayPoint={setPlayPoint} />
    </main>
  )
}

export default Home
