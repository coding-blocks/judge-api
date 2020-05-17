import DB from 'models';
import { Request, Response, NextFunction } from 'express';

export default (key = 'body') => async (req: Request, res: Response, next: NextFunction) => {
  const lang_slug = req[key].lang
  const lang = await DB.langs.findOne({
    where: {
      lang_slug
    }
  })
  if (!lang) {
    return res.status(400).json({
      message: 'Language not Found'
    })
  }

  return next()
}
