import { Pipe, type PipeTransform } from '@angular/core';
import { truncate } from '../utils/string.utils';

@Pipe({
  name: 'appTruncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength = 100): string {
    return truncate(value, maxLength);
  }
}
