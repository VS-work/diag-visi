import * as urlon from 'urlon';
import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  diag = [];
  currentTest;
  detailsMode = false;
  detailsContent;
  loading = false;
  ddfQueryVisible = false;
  fileLoadVisible = false;
  fileStatistics = {};
  totalTime;
  subQueries = [];
  subQueriesInfo = [];
  resourcesInfo = [];
  search = {
    title: '',
    host: 'http://35.195.156.36',
    /*query: `
    {
      "language": "en",
      "from": "datapoints",
      "animatable": "year",
      "select": {
        "key": [
          "municipality",
          "year"
        ],
        "value": [
          "population_20xx_12_31"
        ]
      },
      "where": {
        "$and": [
          {
            "year": "$year"
          }
        ]
      },
      "join": {
        "$year": {
          "key": "year",
          "where": {
            "year": {
              "$gte": "1993",
              "$lte": "2015"
            }
          }
        }
      },
      "order_by": [
        "year"
      ],
      "dataset": "buchslava/readers-test-ds-systema-globalis#master"
    }
    `*/
    query: `
    {
      "from": "datapoints",
      "select": {
        "key": ["geo", "time"],
        "value": ["life_expectancy_years", "income_per_person_gdppercapita_ppp_inflation_adjusted", "population_total"]
      },
      "where": {
        "time": {"$gt": 1800, "$lt": 2016}
      },
      "grouping": {},
      "order_by": ["time", "geo"],
      "dataset": "buchslava/readers-test-ds-systema-globalis#master"
    }
    `
  };

  constructor(private http: HttpClient) {
  }

  ddfRequest() {
    const queryObject = JSON.parse(this.search.query);
    const dataset = queryObject.dataset;
    queryObject.dataset = encodeURIComponent(queryObject.dataset);
    queryObject.diag = 'all';
    const url = `${this.search.host}/api/ddf/ql?${urlon.stringify(queryObject)}`;
    this.loading = true;

    this.http.get(url).subscribe((result: any) => {
      this.diag.push({
        title: `on ${this.search.host} for ${dataset}`,
        executionTime: result.queryTime,
        diagnostic: result._diagnostic
      });
      this.loading = false;
    });
  }

  openFile(event) {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
      const reader = new FileReader();
      reader.onload = () => {
        const diag = JSON.parse(reader.result as string);

        if (diag.query && diag.headers && diag._diagnostic) {
          this.diag = [{
            title: 'Untitled query',
            executionTime: diag.queryTime,
            diagnostic: diag._diagnostic
          }];
        } else {
          this.diag = diag;
        }
      }
      reader.readAsText(input.files[index]);
    };
  }

  setCurrentTest(test) {
    this.currentTest = test;
    this.calculateOptions();
  }

  details(record) {
    this.detailsContent = JSON.stringify(record.attachment, null, 4).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
    this.detailsMode = true;
  }

  calculateOptions() {
    this.fileStatistics = this.getFileLoadStatistics();
    this.totalTime = this.getTotalTime();
    this.subQueries = this.getSubQueries();
    this.resourcesInfo = this.getResourcesInfo();

    for (const subQuery of this.subQueries) {
      const dataLoading = this.getOptionsByStartAndFinish('start all data loading', 'finish all data loading', subQuery);
      const dataTablesProcessing = this.getOptionsByStartAndFinish('dataTables processing', 'queryResult processing', subQuery);
      const queryResultProcessing = this.getOptionsByStartAndFinish('queryResult processing', 'result ordering', subQuery);
      const resultOrdering = this.getOptionsByStartAndFinish('result ordering', 'final result is ready', subQuery);

      this.subQueriesInfo.push({ dataLoading, dataTablesProcessing, queryResultProcessing, resultOrdering });
    }
  }

  private getSubQueries() {
    const result = [];

    for (const item of this.currentTest.diagnostic) {
      if (item.message === 'start all data loading') {
        result.push(JSON.stringify(item.attachment, null, 2).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;'));
      }
    }

    return result;
  }

  private getResourcesInfo() {
    const result = [];

    for (const item of this.currentTest.diagnostic) {
      if (item.message === 'resources list by query') {
        result.push(item.attachment.resources);
      }
    }

    return result;
  }

  private getTotalTime() {
    let result;

    for (const item of this.currentTest.diagnostic) {
      if (item.message === 'start reading') {
        result = new Date(item.time).getTime();
      }

      if (item.message === 'got result') {
        result = new Date(item.time).getTime() - result;
        break;
      }
    }

    return result;
  }

  private getFileLoadStatistics() {
    const storage = {};

    for (const item of this.currentTest.diagnostic) {
      if (item.module.indexOf('vizabi-ddfcsv-reader') !== 0) {
        continue;
      }

      let match = /start reading "([^"]+)"/.exec(item.message);

      if (match && match.length > 0) {
        storage[match[1]] = new Date(item.time).getTime();
      }

      match = /finish reading "([^"]+)"/.exec(item.message);

      if (match && match.length > 0 && storage[match[1]]) {
        storage[match[1]] = new Date(item.time).getTime() - storage[match[1]];
      }
    }

    return storage;
  }

  private getOptionsByStartAndFinish(startMessage: string, finishMessage: string, query: string) {
    let result;

    for (const item of this.currentTest.diagnostic) {
      if (!item.attachment) {
        continue;
      }

      const attachmentStr = JSON.stringify(item.attachment, null, 2).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');

      if (attachmentStr === query) {
        if (item.message === startMessage) {
          result = new Date(item.time).getTime();
        }

        if (item.message === finishMessage) {
          result = (new Date(item.time).getTime() - result);
        }
      }
    }

    return result;
  }
}
