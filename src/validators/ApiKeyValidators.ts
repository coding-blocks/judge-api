import {Request} from 'express'
import {ApiKeyAttrs, ApiKeys} from '../db/models'


export function checkValidApiKey (req: Request): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let apiKey = req.header('Authorization').split('Bearer ')[1]
    if (!apiKey) {
      reject(new Error('No API Key in request'))
    }

    ApiKeys.findOne({
      where: {
        key: apiKey
      }
    }).then((apiKey: ApiKeyAttrs) => {
      if (apiKey.whitelist_domains && apiKey.whitelist_domains.length > 0) {
        if (apiKey.whitelist_domains[0] === '*') {
          return resolve()
        }
        if (apiKey.whitelist_domains.indexOf('Referer')) {
          return resolve()
        }

      }
      if (apiKey.whitelist_ips && apiKey.whitelist_ips.length > 0) {
        if (apiKey.whitelist_ips[0] === '*') {
          return resolve()
        }
        const clientIp = req.header('x-forwarded-for') || req.connection.remoteAddress
        if (apiKey.whitelist_ips.indexOf(clientIp) !== -1) {
          return resolve()
        }
      }
      return reject(new Error('IP or Domain not in whitelist'))
    }).catch((err) => {
      reject(new Error('Invalid API Key'))
    })


  })



}