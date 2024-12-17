export interface IQuestion {
  questionText?: string;
  answerText?: string | null;
  // file?: string | null;
  fromWhom?: string | null;
  whenAsked?: Date | null;
  whenAnswered?: Date | null;
  answered?: boolean | null;
}

export interface IHelpbox {
  email?: string;
  firstName?: string;
  lastName?: string;
  organizations?: string[];
  questionTitle?: string;
  question?:IQuestion[];
  toWhom?: string | null;
  when?: Date | null;
  finalized?: boolean | null;
}