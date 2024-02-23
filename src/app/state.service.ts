import { Injectable } from '@angular/core';
import { Player, Game } from './interfaces';
import {
  BehaviorSubject,
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

  toggleGameSync(time: number,set?:boolean){
    const finding = this.games.value.find(x=> x.time == time)
    if (finding != undefined){
      if (set == undefined) {
        finding.synced = !finding.synced
      } else {
        finding.synced = set
      }
    }
    else console.error("game not found")
  }

  togglePlayerSync(id: string,set?:boolean){
    let finding = this.players.value.find(x=> x.id == id)
    console.log(id)
    console.log(finding)
    if (finding != undefined){
      if (set == undefined) {
        finding.synced = !finding.synced
      } else {
        finding.synced = set
      }
      this.players.next(this.players.value)
    }
    else console.error("player not found")
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

  async addGame(newGame: Game, pushServer = true): Promise<null> {
    return new Promise(
      (resolve) => {
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
        if (mygames.find((x) => x.time == newGame.time) != undefined || newGame.time < 1700000000000) {
          throw new Error("game rejected ")
        }
        mygames.push(newGame);
        this.games.next(mygames);
        this.indexDBService.saveGame(newGame);
        this.rebuildTables();
        resolve(null)
        //inefitient
      }
    )
  }

  async addPlayer(newPlayer: Player, pushServer = true): Promise<null> {
    return new Promise((resolve)=> {
      let buff = this.players.getValue();
      if (newPlayer.name.length < 1) {
        throw Error('Name to short')
      }
      if (buff.filter((p) => p.name == newPlayer.name).length != 0) {
        throw Error("allredy used")
      }
      buff.push(newPlayer);
      this.indexDBService.savePlayer(newPlayer);
      this.players.next(buff);
      this.rebuildTables();
      resolve(null)
    }
    )
  }

  getUnsyncedGames():Game[]{
    return this.games.value.filter(x => x.synced == false)
  }
  getUnsyncedPlayers():Player[]{
    return this.players.value.filter(x => x.synced == false)
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
