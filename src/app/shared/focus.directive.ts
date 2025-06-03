import { Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[appFocus]' })
export class FocusDirective {
    elementRef = inject(ElementRef);
    constructor() {
        this.elementRef.nativeElement.focus();
    }
}
