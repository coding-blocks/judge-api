import { Router } from 'express'
import Controller from './controller'
import { successListener } from 'rabbitmq/jobqueue'

const router: Router = Router()

router.post('/', Controller.SubmitPOST)
successListener.on('submit_result', Controller.onSuccess)

export default router
