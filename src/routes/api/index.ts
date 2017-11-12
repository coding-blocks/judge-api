import {Router} from 'express'
import {route as run} from './run'
import {route as submission} from './submission'

/**
 * @apiDefine AvailableLangs
 * @apiParamExample {String} lang (choices)
 * py2,java7,java8,cpp,cpp14,nodejs6,nodejs8,csharp
 */

const route: Router = Router()
route.use('run', run)
route.use('submission', submission)

export default route