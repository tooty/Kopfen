import { Component} from '@angular/core';
import { loadIndexDbPlayers } from './player.action';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StoreModule, HttpClientModule,CommonModule, RouterOutlet, PlayersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'schafkopf';
  enoughPlayers = true;


  constructor(
    private store: Store
  ) {
  }

  ngOnInit(){
    this.store.dispatch(loadIndexDbPlayers())
  }
}
