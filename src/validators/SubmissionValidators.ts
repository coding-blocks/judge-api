import {Request} from 'express'

export function isInvalidRunRequest(req: Request): Error | boolean {
  // TODO: Validate parameters of submission request (like source should be url)

  if (!req.body.lang || (typeof req.body.lang !== 'string')) {
    return new Error('Invalid Language')
  }
  if (!req.body.source) {
    return new Error('Source not found')
  }
  if (!req.body.stdin) {
    req.body.stdin = ''
  }
  if (!req.body.mode) {
    req.body.mode = 'sync'
  }
  if (!['sync', 'callback', 'poll'].includes(req.body.mode)) {
    return new Error('Mode must be one of sync, callback or poll')
  }
  if (req.body.mode === 'callback' && !req.body.callback) {
    return new Error('Must specify a callback for callback mode')
  }

  return false
}