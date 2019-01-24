import Minio = require('minio')
import v4 =  require('uuid/v4')
import config = require('../../config')

const client = new Minio.Client({
  endPoint: config.S3.endpoint,
  port: config.S3.port,
  useSSL: config.S3.ssl,
  accessKey: config.S3.accessKey,
  secretKey: config.S3.secretKey,
})

export type savedFile = {
  etag: string,
  url: string
}

export const urlForFilename = (bucket: string, filename: string) : string => `http${config.S3.ssl ? 's': ''}://${config.S3.endpoint}/${bucket}/${filename}`

export const upload = function (object:object, filename:string = v4() + '.json' ,bucket:string = config.S3.bucket) : Promise<savedFile> {
  return new Promise((resolve, reject) => {
    client.putObject(bucket, filename, JSON.stringify(object), function(err, etag) {
      if (err) return reject(err)
      resolve({etag, url: urlForFilename(bucket, filename) })
    })
  })
}