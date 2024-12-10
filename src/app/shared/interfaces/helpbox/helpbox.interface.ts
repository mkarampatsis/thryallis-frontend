export interface IHelpbox {
  email?: string;
  lastName?: string;
  firstName?: string;
  organizations?: string[];
  questionText?: string;
  answerText?: string | null;
  toWhom?: string | null;
  when?: Date | null;
  status?: boolean | null;
}