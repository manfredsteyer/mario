import { Directive, inject, ElementRef } from "@angular/core";

@Directive({
  selector: 'select',
  standalone: true,
  host: {
    '(change)': 'onChange($event)',   // neues Attribut-Binding
  }
})
export class BlurOnChangeDirective {

  private el = inject<ElementRef<HTMLSelectElement>>(ElementRef);

  onChange(event: Event) {
    this.el.nativeElement.blur();
  }
}