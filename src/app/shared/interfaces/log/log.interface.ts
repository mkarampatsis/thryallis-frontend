import { ILegalProvision } from "../legal-provision/legal-provision.interface";
import { IRemit } from "../remit/remit.interface";

export interface ILog {
    action: string;
    who: {
        firstName: string;
        lastName: string;
        email: string;
    };
    what: {
        entity : string;
        key: string;
    }
    when: { $date: string };
    change: {
        provisionText?: string;
        remitText?: string;

        legalProvisions?: {
            inserts?: ILegalProvision[];
        };

        old?: IRemit;
        new?: IRemit;
  };
}
