import { Router } from 'express'
import Controller from './controller'

const router: Router = Router()

router.get('/:id', Controller.sendResult)

export default router
