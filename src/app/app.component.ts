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

  details(record) {
    this.detailsContent = JSON.stringify(record.attachment, null, 4).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
    this.detailsMode = true;
  }
}
