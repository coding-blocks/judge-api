import { Router } from 'express'
import DB from 'models'

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
  DB.langs.findAll()
    .then((langs) => {
      res.status(200).json(langs)
    })
})

export { route }