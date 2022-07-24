import React from 'react'
import './Loading.sass'

const Loading = ({ className, ...others }: any) => {
  const cls = className ? className + ' loading' : 'loading'

  return <div className={cls} {...others} />
}


export default Loading
