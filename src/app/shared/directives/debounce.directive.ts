import { Directive, input, output, signal } from '@angular/core';

@Directive({
  selector: '[appDebounce]',
  standalone: true,
  host: {
    '(input)': 'onInputChange($event)',
  },
})
export class DebounceDirective {
  readonly appDebounce = input(300);
  readonly debouncedValue = output<string>();

  private readonly timeoutId = signal<ReturnType<typeof setTimeout> | null>(null);

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    const id = this.timeoutId();
    if (id) {
      clearTimeout(id);
    }

    const newId = setTimeout(() => {
      this.debouncedValue.emit(value);
    }, this.appDebounce());

    this.timeoutId.set(newId);
  }
}
