import { TestcaseResult } from "./result";

export type SubmissionAttributes = {
  id: number,
  lang: string,
  start_time: Date,
  end_time?: Date,
  mode: string,
  callbackURL?: string,
  results?: Array<TestcaseResult>
  outputs?: Array<string>
}
