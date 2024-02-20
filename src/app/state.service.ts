import { Injectable } from '@angular/core';
import { Player, Game } from './interfaces';
import {
  pipe,
  interval,
  BehaviorSubject,
  Observable,
  repeat,
  take,
} from 'rxjs';
import { HttpService } from './http.service';
import { IndexDBService } from './index-db.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private players = new BehaviorSubject<Player[]>([]);
  private games = new BehaviorSubject<Game[]>([]);
  private coastTable = new BehaviorSubject<number[][]>([]);
  private sumTable = new BehaviorSubject<number[][]>([]);
  private syncTime = new BehaviorSubject<number>(0);

  players$ = this.players.asObservable();
  games$ = this.games.asObservable();
  coastTable$ = this.coastTable.asObservable();
  sumTable$ = this.sumTable.asObservable();

  constructor(
    private httpService: HttpService,
    private indexDBService: IndexDBService
  ) {
    this.indexDBService
      .initDB()
      .then(() => {
        this.readInDB();
      })
      .catch((e) => console.error(e));
    interval(2000)
      .pipe(
        repeat(),
        pipe((x) => {
          console.log('getGames', this.syncTime.value);
          return this.httpService.getGames(this.syncTime.value, Date.now());
        })
      )
      .subscribe((x) => this.syncTime.next(Date.now()));
    this.syncTime.next(Number(localStorage.getItem('syncTime')));
    this.syncTime.subscribe((next) =>
      localStorage.setItem('syncTime', this.syncTime.value.toString())
    );
  }

  readInDB() {
    Promise.all([
      this.indexDBService
        .readPlayers()
        .then((players) => {
          this.players.next(players);
        })
        .catch((e) => console.error(e)),
      this.indexDBService
        .readGames()
        .then((games) => {
          this.games.next(games);
        })
        .catch((e) => console.error(e)),
    ]).then(() => this.rebuildTables());
  }

  rebuildTables() {
    this.rebuildCostTable();
    this.rebuildSumTable();
  }

  rebuildCostTable() {
    let table: number[][] = [];
    const games = this.games.value;
    for (let i = 0; i < games.length; i++) {
      table[i] = this.players.value.map((p) => this.getCost(games[i], p)!);
    }
    this.coastTable.next(table);
  }

  rebuildSumTable() {
    let table: number[][] = [];
    let prvious: number[];
    table = this.coastTable.value.map((x, index, t) => {
      if (index == 0) {
        prvious = x;
        return prvious;
      }
      //Vector prvious, x)
      prvious = prvious.map((y, j) => y + x[j]);
      return prvious;
    });
    this.sumTable.next(table);
  }

  removeLocalState() {
    this.indexDBService.reset();
    this.games.next([]);
    this.players.next([]);
    this.rebuildTables();
  }

  addGame(newGame: Game, pushServer = true) {
    let mygames = this.games.getValue();
    newGame.involved.map((p) => {
      if (
        this.players.value.find((pLocal) => pLocal.id == p.playerID) ==
        undefined
      ) {
        this.httpService.getPlayer(p.playerID).subscribe((player) => {
          this.addPlayer(player, false);
        });
      }
    });
    if (mygames.find((x) => x.time == newGame.time) != undefined) {
      return;
    }
    mygames.push(newGame);
    this.games.next(mygames);
    if (pushServer) {
      this.httpService.pushGame(newGame);
    }
    this.indexDBService.saveGame(newGame);
    this.rebuildTables();
    //inefitient
  }

  addPlayer(newPlayer: Player, pushServer = true) {
    let buff = this.players.getValue();
    if (newPlayer.name.length < 1) {
      console.error('Name to short');
      return;
    }
    if (buff.filter((p) => p.name == newPlayer.name).length != 0) {
      console.error('Name already used');
      return;
    }
    buff.push(newPlayer);
    if (pushServer) {
      this.httpService.pushPlayer(newPlayer);
    }
    this.indexDBService.savePlayer(newPlayer);
    this.players.next(buff);
    this.rebuildTables();
  }

  getCost(game: Game, player: Player): number | null {
    //returns individual palance change for perticluar game
    let winnerCount = 0;

    game.involved.forEach((p) => {
      if (p.winner) {
        winnerCount++;
      }
    });

    const serchedPlayer = game.involved.find((x) => x.playerID == player.id);
    if (serchedPlayer == undefined) {
      return null;
    }

    if (serchedPlayer.winner) {
      if (winnerCount == 1) {
        return game.cost * 3;
      }
      return game.cost;
    } else {
      if (winnerCount == 3) {
        return -game.cost * 3;
      }
      return -game.cost;
    }
  }
}
