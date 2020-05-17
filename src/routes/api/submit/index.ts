import { Router } from 'express'
import Controller from './controller'
import Validator from './validators'
import { successListener } from 'rabbitmq/jobqueue'
import langValidator from 'middlewares/langValidator'

const router: Router = Router()
const validator = new Validator()

router.post('/', validator.POST, langValidator(), Controller.submitPOST)
successListener.on('submit_result', Controller.onSuccess)

export default router
