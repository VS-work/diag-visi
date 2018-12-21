import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  diag;
  currentTest;
  detailsMode = false;
  detailsContent;
  search = {
    title: ''
  };

  /*
      debug('start all data loading', queryParam);
      debug('finish all data loading', queryParam);

  */


  /*
  debug('dataTables processing');
  debug('queryResult processing');
  */


  /*
          debug('queryResult processing', queryParam);
        debug('result ordering', queryParam);
  */


  /*
          debug('result ordering', queryParam);
        debug('final result is ready', queryParam);

  */

  /*
      debug(`start reading "${filePath}"`);
      debug(`finish reading "${filePath}"`);
  */

  /*
      debug('resources list by query', {queryParam, resources});
  */


  openFile(event) {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
        const reader = new FileReader();
        reader.onload = () => {
            this.diag = JSON.parse(reader.result as string);
        }
        reader.readAsText(input.files[index]);
    };
  }

  setCurrentTest(test) {
    this.currentTest = test;
    // this.calculateOptions();
  }

  details(record) {
    this.detailsContent = JSON.stringify(record.attachment, null, 4).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
    this.detailsMode = true;
  }

  calculateOptions() {
    console.log(this.getOptionsByStartAndFinish('start all data loading', 'finish all data loading'));
  }

  private getOptionsByStartAndFinish(startMessage: string, finishMessage: string): any {
    const result = {};

    for (const item of this.currentTest.diagnostic) {
      if (item.message === startMessage) {
        const hash = JSON.stringify(item.attachment);
        result[hash] = new Date(item.time).getTime();
      }

      if (item.message === finishMessage) {
        const hash = JSON.stringify(item.attachment);
        result[hash] = (new Date(item.time).getTime() - result[hash]);
      }
    }

    return result;
  }
}
