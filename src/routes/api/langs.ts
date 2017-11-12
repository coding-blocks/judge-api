import {Router} from 'express'

const route: Router = Router()

/**
 * @api {get} /langs GET /langs
 * @apiDescription Get all supported Languages
 * @apiName GetLangs
 * @apiGroup Langs
 * @apiVersion 0.0.1
 *
 *
 */
route.get('/', (req, res, next) => {

})

export {route}