import { Pipe, type PipeTransform } from '@angular/core';
import { formatDate } from '../utils/date.utils';

@Pipe({
  name: 'appDateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date, pattern = 'dd/MM/yyyy'): string {
    return formatDate(value, pattern);
  }
}
