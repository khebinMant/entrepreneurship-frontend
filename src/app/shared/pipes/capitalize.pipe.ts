import { Pipe, type PipeTransform } from '@angular/core';
import { capitalize } from '../utils/string.utils';

@Pipe({
  name: 'appCapitalize',
  standalone: true,
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    return capitalize(value);
  }
}
