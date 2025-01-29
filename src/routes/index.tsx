import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Metas from 'src/components/Metas/Metas'
import TopBar from 'src/components/TopBar/TopBar'
import Home from './Home/Home'
import Events from './Events/Events'
import Config from './Config/Config'

const App = () =>
  <>
    <Metas />
    <TopBar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/config/*" element={<Config />} />
    </Routes>
  </>

export default App
