import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilService {
    convertEmptyStringsToNull(obj: any): any {
        if (typeof obj === 'string') {
            return obj === '' ? null : obj;
        } else if (Array.isArray(obj)) {
            return obj.map((item) => this.convertEmptyStringsToNull(item));
        } else if (typeof obj === 'object' && obj !== null) {
            const newObj: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    newObj[key] = this.convertEmptyStringsToNull(obj[key]);
                }
            }
            return newObj;
        }
        return obj;
    }
}
