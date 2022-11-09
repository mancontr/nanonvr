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
          <span className="icon icon-home" />
          <span className="label">
            <FormattedMessage id="topbar.home" />
          </span>
        </NavLink>
        <NavLink to="/events">
          <span className="icon icon-history" />
          <span className="label">
            <FormattedMessage id="topbar.events" />
          </span>
        </NavLink>
        <NavLink to="/config">
          <span className="icon icon-config" />
          <span className="label">
            <FormattedMessage id="topbar.config" />
          </span>
        </NavLink>
      </div>
    </header>
  )
}

export default TopBar
