import { Pipe, PipeTransform } from '@angular/core';

/** 1994 -> "1,994 EGP" (no trailing .00, one consistent price format). */
@Pipe({ name: 'egp' })
export class EgpPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const n = value ?? 0;
    return `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} EGP`;
  }
}
