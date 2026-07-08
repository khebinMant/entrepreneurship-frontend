import { Directive, ElementRef, inject, output, DestroyRef } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly appClickOutside = output<void>();

  constructor() {
    const handler = (event: MouseEvent) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.appClickOutside.emit();
      }
    };
    document.addEventListener('click', handler);
    this.destroyRef.onDestroy(() => document.removeEventListener('click', handler));
  }
}
