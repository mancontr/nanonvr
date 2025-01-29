import React from 'react'
import { Routes, Route } from 'react-router-dom'
import CamEdit from './CamEdit/CamEdit'
import CamList from './CamList/CamList'

const Config = () => {
  return (
    <Routes>
      <Route index element={<CamList />} />
      <Route path="new" element={<CamEdit />} />
      <Route path=":id" element={<CamEdit />} />
    </Routes>
  )
}

export default Config
