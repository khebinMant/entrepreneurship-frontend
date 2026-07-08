import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
  host: {
    '[title]': 'appTooltip()',
  },
})
export class TooltipDirective {
  readonly appTooltip = input<string>('');
}
