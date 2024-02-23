import { Injectable } from '@angular/core';
import {HttpService} from './http.service';
import {StateService} from './state.service';
import { Player, Game } from './interfaces';
import { Observable, interval, repeat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControlerService {

  constructor(
    private stateService: StateService,
    private httpService: HttpService
  ) {
    const syncLoop = new Observable<null>()
    syncLoop.pipe((x)=>{this.queueUnsynced();return x})
    syncLoop.pipe(repeat({delay: 3000}))
  }

  addGame(ng: Game){
    this.stateService.addGame(ng).then(()=>{
      if (!ng.synced) {
        this.pushGameToServer(ng)
      }
    })
  }

  addPlayer(np: Player){
    this.stateService.addPlayer(np).then(()=>{
      if (!np.synced) {
        this.pushPlayerToServer(np)
      }
    })
  }

  pushGameToServer(g: Game){
    const obs = this.httpService.pushGame({content: g,URL:'/game'})
    obs.subscribe(
       ()=> {
          g.synced = true
          this.stateService.gameUpdated(g)
        }
    )
  }

  pushPlayerToServer(p: Player){
    const obs = this.httpService.pushGame({content: p,URL:'/player'})
    obs.subscribe(
        () => {
          console.log("here")
          p.synced = true
          this.stateService.playerUpdated(p)
        }
    )
  }

  loadServerGames(s: Date, e: Date){
    this.httpService.getGames(s.getTime(), e.getTime())
      .subscribe((data) => {
        data.map((x) => {
          this.stateService.addGame(x, false);
        });
      });
  }

  queueUnsynced(){
    this.stateService.getUnsyncedPlayers().map((x)=>{
      this.pushPlayerToServer(x)
    })
    this.stateService.getUnsyncedGames().map((x)=>{
      this.pushGameToServer(x)
    })
  }
}
