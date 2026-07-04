import { Injectable } from '@angular/core';
import {
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbDatepickerI18n
} from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class NgbDateELParserFormatter extends NgbDateParserFormatter {

  format(date: NgbDateStruct | null): string {
    return date
      ? `${this.pad(date.day)}/${this.pad(date.month)}/${date.year}`
      : '';
  }

  parse(value: string): NgbDateStruct | null {
    if (!value) return null;

    const parts = value.split('/');
    if (parts.length !== 3) return null;

    return {
      day: Number(parts[0]),
      month: Number(parts[1]),
      year: Number(parts[2])
    };
  }

  private pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }
}

@Injectable()
export class NgbDateELI18n extends NgbDatepickerI18n {

  private readonly WEEKDAYS = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ'];
  private readonly MONTHS = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];

  // REQUIRED in ng-bootstrap v14
  getWeekdayLabel(weekday: number, width?: any): string {
    return this.WEEKDAYS[weekday - 1];
  }

  getWeekdayShortName(weekday: number): string {
    return this.WEEKDAYS[weekday - 1];
  }

  getMonthShortName(month: number): string {
    return this.MONTHS[month - 1];
  }

  getMonthFullName(month: number): string {
    return this.MONTHS[month - 1];
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}
