import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlefilter',
  pure: false
})
export class TitleFilterPipe implements PipeTransform {
  transform(items: any[], filter: string): any[] {
    if (!items || !filter) {
      return items;
    }

    return items.filter((item: any) => this.applyFilter(item, filter));
  }

  applyFilter(item: any, filter: string): boolean {
    if (filter && item && item.title.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
      return false;
    }

    return true;
  }
}
