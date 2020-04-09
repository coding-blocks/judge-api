export interface TestcaseResult {
  id: number,
  score: number,
  time: string,
  result: string
}

export interface Result {
  id: number,
  stderr: string,
}

export interface RunResult extends Result {
  stdout: string,
  time: number,
  code: number
}

export interface SubmissionResult extends Result {
  testcases: Array<TestcaseResult>
}
