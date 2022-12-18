import React from 'react'
import Feeds from 'src/components/Feeds/Feeds'
import Snaps from 'src/components/Snaps/Snaps'
import Timeline from 'src/components/Timeline/Timeline'
import './Home.sass'
import { PlayPointProvider, usePlayPoint } from './PlayPointContext'

const Home = () => {
  const playPoint = usePlayPoint()

  return (
    <main id="home">
      {playPoint?.ts
        ? <Feeds />
        : <Snaps  />
      }
      <Timeline />
    </main>
  )
}

const HomeWrapper = () =>
  <PlayPointProvider>
    <Home />
  </PlayPointProvider>

export default HomeWrapper
