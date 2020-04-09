import { Request, Response, NextFunction } from 'express'

class RunValidator {
  POST(req: Request, res: Response, next: NextFunction) {
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
    if (!['sync', 'callback'].includes(req.body.mode)) {
      return new Error('Mode must be one of sync, callback')
    }
    if (req.body.mode === 'callback' && !req.body.callback) {
      return new Error('Must specify a callback for callback mode')
    }
  
    return next()
  }
}

export default new RunValidator()
