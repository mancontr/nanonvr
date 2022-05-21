import React from 'react'
import { FormattedMessage } from 'react-intl'
import { NavLink } from 'react-router-dom'
import './TopBar.sass'

const TopBar = () => {
  return (
    <header id="top-bar">
      <h1><FormattedMessage id="title" /></h1>
      <div className="sections">
        <NavLink to="/" exact>
          <FormattedMessage id="topbar.home" />
        </NavLink>
        <NavLink to="/config">
          <FormattedMessage id="topbar.config" />
        </NavLink>
      </div>
    </header>
  )
}

export default TopBar
