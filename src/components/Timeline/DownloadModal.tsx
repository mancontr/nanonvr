import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import basename from 'src/util/basename'
import './DownloadModal.sass'

const DEFAULT_WINDOW_MS = 5 * 60 * 1000

const toLocalInput = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromLocalInput = (value: string) => value ? new Date(value).getTime() : NaN

interface DownloadModalProps {
  camId: string
  anchorTs: number
  onClose: () => void
}

const DownloadModal = ({ camId, anchorTs, onClose }: DownloadModalProps) => {
  const defaultStart = Math.floor(anchorTs / 60000) * 60000
  const [start, setStart] = useState(() => toLocalInput(defaultStart))
  const [end, setEnd] = useState(() => toLocalInput(defaultStart + DEFAULT_WINDOW_MS))

  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const startMs = fromLocalInput(start)
  const endMs = fromLocalInput(end)
  const valid = Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < endMs

  const handleSubmit = e => {
    e.preventDefault()
    if (!valid) return
    const url = `${basename}/media/${camId}/download?start=${startMs}&end=${endMs}`
    const a = document.createElement('a')
    a.href = url
    a.download = ''
    a.click()
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2><FormattedMessage id="download.title" /></h2>
          <span className="icon-cross" onClick={onClose} />
        </div>
        <label>
          <span><FormattedMessage id="download.start" /></span>
          <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
        </label>
        <label>
          <span><FormattedMessage id="download.end" /></span>
          <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required />
        </label>
        <div className="buttons">
          <button className="primary" disabled={!valid}>
            <FormattedMessage id="download.confirm" />
          </button>
          <button type="button" onClick={onClose}>
            <FormattedMessage id="download.cancel" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default DownloadModal
