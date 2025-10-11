export interface IQuestion {
  id?: string | null;
  questionText?: string;
  answerText?: string | null;
  questionFile?: string[] | [];
  answerFile?: string | null;
  fromWhom?: {
    email?: string;
    taxid?: string
    firstName?: string;
    lastName?: string;
  };
  whenAsked?: Date | null;
  whenAnswered?: Date | null;
  answered?: boolean | null;
  published?: boolean | null;
}

export interface IHelpbox {
  key?: string;
  email?: string;
  taxid?: string
  firstName?: string;
  lastName?: string;
  organizations?: string[];
  questionTitle?: string;
  questionCategory?: string;
  questions?: IQuestion[];
  toWhom?: {
    email?: string;
    taxid?: string
    firstName?: string;
    lastName?: string;
  }
  finalized?: boolean | null;
}

export interface IFile_Upload {
  google_id: string;
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: string;
  file_location: string;
}

export interface IGeneralInfo {
  email?: string;
  taxid?: string
  firstName?: string;
  lastName?: string;
  title?: string;
  text?: string | null;
  file?: string[] | [];
  when?: Date | null;
  // tags?: string[] | null;
  category?: string | null;
}