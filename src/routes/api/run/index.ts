import { Router } from 'express'
import Controller from './controller'
import Validator from './validators'
import { successListener } from 'rabbitmq/jobqueue'

const router: Router = Router()
const validator = new Validator()

router.post('/', validator.POST, Controller.runPOST)
successListener.on('run_result', Controller.onSuccess)

export default router
