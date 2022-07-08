import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Metas from 'src/components/Metas/Metas'
import TopBar from 'src/components/TopBar/TopBar'
import Home from './Home/Home'
import Config from './Config/Config'

const App = () =>
  <>
    <Metas />
    <TopBar />
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/config" component={Config} />
    </Switch>
  </>

export default App
