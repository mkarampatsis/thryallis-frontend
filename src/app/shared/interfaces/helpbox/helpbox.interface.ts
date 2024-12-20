export interface IQuestion {
    id?: string | null;    
    questionText?: string;
    answerText?: string | null;
    // file?: string | null;
    fromWhom?: string | null;
    whenAsked?: Date | null;
    whenAnswered?: Date | null;
    answered?: boolean | null;
    published?: boolean | null;
}

export interface IHelpbox {
    email?: string;
    firstName?: string;
    lastName?: string;
    organizations?: string[];
    questionTitle?: string;
    questions?:IQuestion[];
    toWhom?: string | null;
    finalized?: boolean | null;
}