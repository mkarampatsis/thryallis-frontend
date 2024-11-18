export interface ILog {
    action: string;
    who: string;
    what: {
        entity : string;
        key: string;
    }
    when: Date;
    change: object;
}
