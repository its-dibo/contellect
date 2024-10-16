import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'encodeUrl',
  standalone: true,
})
export class EncodeUrlPipe implements PipeTransform {
  transform(value: string, component = true): string {
    return component ? encodeURIComponent(value) : encodeURI(value);
  }
}
