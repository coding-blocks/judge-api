import { Request, Response, NextFunction } from 'express';
import * as Joi from '@hapi/joi';

export default class BaseValidator {
  constructor() {
    new Array(
      'requestValidator'
    ).map(_ => {
      this[_] = this[_].bind(this)
    })
  }

  forbid(err, res: Response) {
    return res
      .status(err.code || 400)
      .json({
        err
      })
  }

  requestValidator(schema, key = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
      // add lang constraint
      const langKeys = res.locals.langs.map(lang => lang.lang_slug);
      Object.assign(schema, schema.keys({
        lang: Joi.string().valid(...langKeys).required()
      }));

      const { error } = schema.validate(req[key], { allowUnknown: true })
      if (error) {
        return this.forbid({message: error.details[0].message, code: 400}, res)
      }

      next()
    }
  }
}
