export interface Request {
  source: string, // Base64 encoded
  lang: string,
  mode?: string, // default sync
  timlimit?: number, // default 5
  callback?: string // default null
}

export interface RunRequest extends Request {
  stdin: string
}

export interface Testcase {
  id: number, 
  input: string, 
  output: string
}

export interface SubmitRequest extends Request {
  testcases: Array<Testcase>
}
