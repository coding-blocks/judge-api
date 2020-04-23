import { Handler } from 'express'
import BaseValidator from 'validators/baseValidator'
import * as Joi from '@hapi/joi'

export default class RunValidator extends BaseValidator {
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
    stdin: Joi
      .string()
      .allow(''),
    timelimit: Joi
      .number(),
    callback: Joi
      .string()
      .uri()
      .when('mode', { is: 'callback', then: Joi.required() }),
    enc: Joi
      .string()
      .valid('base64', 'url')
  })
}
