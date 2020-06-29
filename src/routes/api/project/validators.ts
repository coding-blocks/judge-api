import { Handler } from 'express'
import BaseValidator from 'validators/baseValidator'
import * as Joi from '@hapi/joi'

export default class ProjectValidator extends BaseValidator {
    POST: Handler

    constructor() {
        super()
        this.POST = this.requestValidator(this.POSTSchema)
    }

    POSTSchema = Joi.object({
        lang: Joi
            .string()
            .required(),
        problem: Joi
            .string()
            .uri()
            .required(),
        submission: Joi
            .string()
            .uri()
            .required(),
        config: Joi
            .string()
            .required(),
        mode: Joi
            .string()
            .valid('sync', 'callback', 'poll'),
        callback: Joi
            .string()
            .uri()
            .when('mode', { is: 'callback', then: Joi.required() }),
        timelimit: Joi
            .number(),
    })
}
