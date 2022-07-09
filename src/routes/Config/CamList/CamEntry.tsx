import React from 'react'
import { Link } from 'react-router-dom'
import { Camera } from 'src/types'
import { baseUrl } from 'src/config'

interface CamEntryProps {
  cam: Camera
}

const CamEntry = ({ cam }: CamEntryProps) => {
  const style: any = {}
  if (cam.snapshot) style.backgroundImage = `url("${baseUrl}/cameras/${cam.uuid}/snapshot")`
  return (
    <Link className="cam-entry" to={'/config/' + cam.uuid} style={style}>
      <span className="title">{cam.name}</span>
    </Link>
  )
}

export default CamEntry
