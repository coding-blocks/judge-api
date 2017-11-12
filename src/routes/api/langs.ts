import {Router} from 'express'
import {Langs} from '../../db/models'

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
  Langs.findAll()
    .then((langs) => {
      res.status(200).json(langs)
    })
})

export {route}