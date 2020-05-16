import Minio = require('minio')
import v4 =  require('uuid/v4')
import axios from 'axios'

const config = require('../../config/config')
const client = new Minio.Client({
  endPoint: config.S3.endpoint,
  port: +config.S3.port,
  useSSL: !!config.S3.ssl,
  accessKey: config.S3.accessKey,
  secretKey: config.S3.secretKey,
  region: config.S3.region
})

export type savedFile = {
  etag: string,
  url: string
}

export const urlForFilename = (bucket: string, filename: string) : string => `http${config.S3.ssl ? 's': ''}://${config.S3.endpoint}/${bucket}/${filename}`

/**
 * Uploads an object to s3 encoded as json
 * @param {object} object
 * @param {string} filename The filename (Default = randomized)
 * @param {string} bucket The bucket name (Default = picked from config.json)
 * @returns {Promise<savedFile>} The etag and url for the file saved
 */
export const upload = function (object:object, filename:string = v4() + '.json' ,bucket:string = config.S3.bucket) : Promise<savedFile> {
  return new Promise((resolve, reject) => {
    client.putObject(bucket, filename, JSON.stringify(object), function(err, etag) {
      if (err) return reject(err)
      resolve({etag, url: urlForFilename(bucket, filename) })
    })
  })
}

/**
 * Downloads a file from url and encodes it 
 * @param {string} url
 * @param {string} enc (Default = 'base64')
 * @returns {Promise<string>} the downloaded file encoded as specified
 */
export const download = async function (url: string, enc: string = 'base64') : Promise<string> {
  if (!url) return ''
   
  const {data} = await axios.get(url)
  return Buffer.from(data).toString(<any>enc)
}