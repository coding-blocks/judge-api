import { Handler } from 'express'
import BaseValidator from 'validators/baseValidator'
import * as Joi from '@hapi/joi'

export default class SubmitValidator extends BaseValidator {
  POST: Handler

  constructor() {
    super()
    this.POST = this.requestValidator(this.POSTSchema)
  }

  POSTSchema = Joi.object({
    lang: Joi
      .string()
      .required(),
    source: Joi
      .string()
      .required(),
    mode: Joi
      .string()
      .valid('sync', 'callback', 'poll'),
    timelimit: Joi
      .number(),
    callback: Joi
      .string()
      .uri()
      .when('mode', { is: 'callback', then: Joi.required() }),
    testcases: Joi
      .array()
      .min(1)
      .items(
        Joi.object({
          id: Joi.number().required(),
          stdin: Joi.string().uri(),
          stdout: Joi.string().uri()
        })
      )
      .required()
  })
}
