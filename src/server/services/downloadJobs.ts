import fs from 'fs'
import { randomUUID } from 'crypto'
import { generateRange, ConcatEntry, RangeMetadata } from './ffmpeg'

const JOB_TTL_MS = 5 * 60 * 1000

interface DownloadJob {
  status: 'pending' | 'done' | 'error'
  filePath: string
  filename: string
  error?: string
  cleanupTimeout?: NodeJS.Timeout
}

const jobs = new Map<string, DownloadJob>()

export const startDownloadJob = (files: ConcatEntry[], filePath: string, filename: string, metadata: RangeMetadata): string => {
  const id = randomUUID()
  const job: DownloadJob = { status: 'pending', filePath, filename }
  jobs.set(id, job)

  generateRange(files, filePath, metadata)
    .then(() => { job.status = 'done' })
    .catch(err => {
      console.error('[download] ffmpeg failed to generate range', err)
      job.status = 'error'
      job.error = err.message
      fs.unlink(filePath, () => {})
    })
    .finally(() => {
      job.cleanupTimeout = setTimeout(() => removeJob(id), JOB_TTL_MS)
    })

  return id
}

export const getDownloadJob = (id: string): DownloadJob =>
  jobs.get(id)

export const consumeDownloadJob = (id: string): DownloadJob => {
  const job = jobs.get(id)
  if (job) {
    clearTimeout(job.cleanupTimeout)
    jobs.delete(id)
  }
  return job
}

const removeJob = (id: string) => {
  const job = jobs.get(id)
  if (!job) return
  jobs.delete(id)
  if (job.status === 'done') fs.unlink(job.filePath, () => {})
}
