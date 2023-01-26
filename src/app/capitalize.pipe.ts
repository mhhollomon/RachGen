import { Pipe, PipeTransform } from '@angular/core';

import { capitalize } from './utils/util-library';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    return capitalize(value);
  }

}
