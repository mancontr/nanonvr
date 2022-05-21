import React from 'react'
import { Link } from 'react-router-dom'
import { Camera } from 'src/types'

interface CamEntryProps {
  cam: Camera
}

const CamEntry = ({ cam }: CamEntryProps) => {
  return (
    <Link className="cam-entry" to={'/config/' + cam.uuid}>
      {cam.name}
    </Link>
  )
}

export default CamEntry
