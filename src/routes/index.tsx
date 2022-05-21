import React from 'react'
import { Switch, Route } from 'react-router-dom'
import TopBar from 'src/components/TopBar/TopBar'
import Home from './Home/Home'
import Config from './Config/Config'

const App = () =>
  <>
    <TopBar />
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/config" exact component={Config} />
    </Switch>
  </>

export default App
