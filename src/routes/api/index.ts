import {NextFunction, Request, Response, Router} from 'express'
import run from './run'
import {route as submissions} from './submissions'
import {route as langs} from './langs'
import {checkValidApiKey} from '../../validators/ApiKeyValidators'
import * as debug from 'debug'

const log = debug('judge:api')

/**
 * @apiDefine AvailableLangs
 * @apiParamExample {String} lang (choices)
 * py2,java7,java8,cpp,cpp14,nodejs6,nodejs8,csharp
 */

const route: Router = Router()

route.use((req: Request, res: Response, next: NextFunction) => {
  log('Checking API validity')
  checkValidApiKey(req)
    .then(() => next())
    .catch((err: Error) => res.status(403).json({
      code: 403,
      message: err.message
    }))
})

route.use('/runs', run)
route.use('/submissions', submissions)
route.use('/langs', langs)

export default route