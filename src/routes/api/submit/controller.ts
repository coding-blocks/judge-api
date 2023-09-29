import { Request, Response } from 'express'
import { SubmissionJob, queueJob } from 'rabbitmq/jobqueue'
import DB from 'models'
import axios from 'axios'

type Testcase = {
  id: number,
  score: number,
  time: string,
  result: string
}

type SubmitResponse = {
  id: number,
  stderr: string,
  testcases: Array<Testcase>
}

type RunPoolElement = {
  res: Response
}

const RunPool: { [x: number]: RunPoolElement } = {}

export default {
  async submitPOST(req: Request, res: Response) {
    const mode = req.body.mode || 'sync'
    const enable_custom_testcase_checker = req.body.enable_custom_testcase_checker
    const job = await DB.submissions.create({
      lang: req.body.lang,
      start_time: new Date(),
      mode,
      callback: req.body.callback
    })

    await queueJob(<SubmissionJob>{
      id: job.id,
      source: req.body.source,
      lang: req.body.lang,
      timelimit: req.body.timelimit,
      testcases: req.body.testcases,
      enable_custom_testcase_checker: enable_custom_testcase_checker === 'false' ? false : !!enable_custom_testcase_checker,
      custom_testcase_checker_code: req.body.custom_testcase_checker_code,
      scenario: 'submit'
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

  async onSuccess(result: SubmitResponse) {    
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
