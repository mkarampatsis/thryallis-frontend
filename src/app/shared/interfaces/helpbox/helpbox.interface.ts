export interface IQuestion {
    id?: string | null;    
    questionText?: string;
    answerText?: string | null;
    questionFile?: string | null;
    answerFile?: string | null;
    fromWhom?: string | null;
    whenAsked?: Date | null;
    whenAnswered?: Date | null;
    answered?: boolean | null;
    published?: boolean | null;
}

export interface IHelpbox {
    key?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    organizations?: string[];
    questionTitle?: string;
    questionCategory?: string;
    questions?:IQuestion[];
    toWhom?: string | null;
    finalized?: boolean | null;
}

export interface IGeneralInfo {
    email?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    text?: string | null;
    file?: string | null;
    when?: Date | null;
    // tags?: string[] | null;
    category?: string | null;
}