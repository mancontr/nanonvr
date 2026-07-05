import React, { useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import basename from 'src/util/basename'
import Loading from 'src/components/Loading/Loading'
import './DownloadModal.sass'

const DEFAULT_WINDOW_MS = 5 * 60 * 1000
const POLL_INTERVAL_MS = 1500

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
  const [stage, setStage] = useState<'form' | 'generating' | 'error'>('form')
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => () => clearInterval(pollRef.current), [])

  const startMs = fromLocalInput(start)
  const endMs = fromLocalInput(end)
  const valid = Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < endMs

  const poll = (id: string) => {
    pollRef.current = setInterval(async () => {
      const res = await fetch(`${basename}/media/downloads/${id}/status`)
      if (!res.ok) {
        clearInterval(pollRef.current)
        setStage('error')
        return
      }
      const job = await res.json()
      if (job.status === 'done') {
        clearInterval(pollRef.current)
        const a = document.createElement('a')
        a.href = `${basename}/media/downloads/${id}`
        a.download = ''
        a.click()
        onClose()
      } else if (job.status === 'error') {
        clearInterval(pollRef.current)
        setStage('error')
      }
    }, POLL_INTERVAL_MS)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!valid) return
    setStage('generating')
    try {
      const res = await fetch(`${basename}/media/${camId}/download?start=${startMs}&end=${endMs}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to start download')
      const { id } = await res.json()
      poll(id)
    } catch {
      setStage('error')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2><FormattedMessage id="download.title" /></h2>
          <span className="icon-cross" onClick={onClose} />
        </div>

        {stage === 'form' &&
          <>
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
          </>
        }

        {stage === 'generating' &&
          <>
            <Loading />
            <p className="status-message"><FormattedMessage id="download.generating" /></p>
            <div className="buttons">
              <button type="button" onClick={onClose}>
                <FormattedMessage id="download.cancel" />
              </button>
            </div>
          </>
        }

        {stage === 'error' &&
          <>
            <p className="status-message"><FormattedMessage id="download.error" /></p>
            <div className="buttons">
              <button type="button" className="primary" onClick={() => setStage('form')}>
                <FormattedMessage id="download.retry" />
              </button>
              <button type="button" onClick={onClose}>
                <FormattedMessage id="download.cancel" />
              </button>
            </div>
          </>
        }
      </form>
    </div>
  )
}

export default DownloadModal
