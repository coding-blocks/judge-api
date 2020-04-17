import { Router } from 'express'
import Controller from './controller'
import Validator from './validators'
import { successListener } from 'rabbitmq/jobqueue'

const router: Router = Router()

router.post('/', Validator.POST, Controller.SubmitPOST)
successListener.on('submit_result', Controller.onSuccess)

export default router
