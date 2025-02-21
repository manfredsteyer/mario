import { Component } from '@angular/core';
import { LevelComponent } from './level/level.component';

@Component({
  selector: 'app-root',
  imports: [LevelComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'mario';
}
