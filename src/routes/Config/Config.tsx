import React from 'react'
import { Switch, Route } from 'react-router-dom'
import CamEdit from './CamEdit/CamEdit'
import CamList from './CamList/CamList'

const Config = () => {
  return (
    <Switch>
      <Route path="/config" exact component={CamList} />
      <Route path="/config/new" exact component={CamEdit} />
      <Route path="/config/:id" exact component={CamEdit} />
    </Switch>
  )
}

export default Config
