import {Request, Response} from 'express';
import DB from 'models'

export default {
  async sendResult(req: Request, res: Response) {
    const submissionId = req.params.id ? parseInt(req.params.id) : null
    if (!submissionId) {
      res.status(400).json({err: 'SubmissionId not found'})
    } else {
      DB.submissions.findByPk(submissionId)
          .then((submission) => {
            res.status(200).json(submission.results)
          }).catch((err) => {
        res.status(404).json({err: 'Submission not found'})
      })
    }
  }
}