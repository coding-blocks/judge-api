import { Request, Response } from 'express'
import {ProjectJob, queueJob} from 'rabbitmq/jobqueue'
import DB from 'models'
import axios from 'axios'

type ProjectResponse = {
    id: number,
    stdout: string,
    stderr: string,
    time: number,
    code: number,
    score: number
}
type RunPoolElement = {
    res: Response
}

const RunPool: { [x: number]: RunPoolElement } = {}

export default {
    async runPOST(req: Request, res: Response) {
        const mode = req.body.mode || 'sync'
        const job = await DB.submissions.create({
            lang: req.body.lang,
            start_time: new Date(),
            mode,
            callback: req.body.callback
        })

        await queueJob(<ProjectJob>{
            id: job.id,
            source: req.body.submission,
            problem: req.body.problem,
            lang: req.body.lang,
            config: req.body.config,
            timelimit: req.body.timelimit,
            scenario: 'project'
        })


        if (['callback', 'poll'].includes(mode)) {
            return res.json({
                id: job.id
            })
        }

        // if mode === 'sync'
        RunPool[job.id] = {
            res
        }
    },

    async onSuccess(result: ProjectResponse) {
        const job = await DB.submissions.findById(result.id)
        job.results = result
        await job.save()

        switch (job.mode) {
            case 'callback':
                await axios.post(job.callback, result)
                break
            case 'sync':
                RunPool[job.id].res.json(result)
                break
        }
    }
}
