import {RunJob} from '../rabbitmq/jobqueue'
import {download} from './s3'

/**
 * Normalizes the Run Job (effectively normalizes source and stdin to base64 immediate values)
 * @param {RunJob} job
 * @param {string} enc (Default = 'base64')
 * @returns {Promise<RunJob>} the normalized runJob
 */
export const normalizeRunJob = async function (job: RunJob, enc:string = 'base64') : Promise<RunJob> {
  switch (enc) {
    case 'url':
      const [source, stdin] = await Promise.all([download(job.source), download(job.stdin)])
      return {
        ...job,
        source,
        stdin
      }
    default: return job
  }
}