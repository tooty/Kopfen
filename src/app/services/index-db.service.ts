import { Injectable } from '@angular/core';
import { Game } from '../interfaces';
import { Player } from '../interfaces';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexDBService {
  private db: IDBDatabase | null = null;

  constructor() {}

  async reset(): Promise<boolean> {
    return new Promise<boolean>((res)=>{
      this.db?.close()
      let delet = window.indexedDB.deleteDatabase('appState');
      delet.onerror = (ev) => {throw Error(JSON.stringify(ev))};
      delet.onsuccess = () => {
        this.initDB().then(()=>res(true)).catch((e)=> {throw Error(e)})
      };
    })
  }

  async saveGame(newGame: Game) : Promise<boolean> {
    console.log("saveGame")
    return new Promise( res=> {
      if (this.db != null) {
        const trans = this.db.transaction('games', 'readwrite');
        let req = trans.objectStore('games').add(newGame);
        req.onerror = () => {throw throwError(()=>{"save Game Failed"})}
        req.onsuccess = () => res(true)
      } else {
      throw throwError(()=> "no IndexDB")
      }
    })
  }

  async savePlayer(newPlayer: Player): Promise<boolean>  {
    return new Promise( res=> {
      if (this.db != null){
        const trans = this.db.transaction('players', 'readwrite');
        let req = trans.objectStore('players').add(newPlayer);
        req.onerror = () => {throw throwError(()=>{"save Game Failed"})}
        req.onsuccess = () => res(true);
      }else{
        throw throwError(()=> "no IndexDB")
      }
    })
  }

  async initDB() : Promise<void> {
    return new Promise((res)=> {
      let request = indexedDB.open('appState', 2);
      request.onerror = (ev) => {throw Error(JSON.stringify(ev))};

      request.onupgradeneeded = () => {
        this.db = request.result;

        if (!this.db.objectStoreNames.contains('games')) {
          this.db.createObjectStore('games', {
            keyPath: 'time',
            autoIncrement: true,
          });
        }
        if (!this.db.objectStoreNames.contains('players')) {
          this.db.createObjectStore('players', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };
      request.onsuccess = () => {this.db = request.result;res();}
    }
  )
  }

  async readPlayers(): Promise<Player[]> {
    return new Promise<Player[]>((res, rej) => {
      if (this.db == null) {
        throw new Error('no IndexDB');
      }
      const trans = this.db.transaction(['players']);
      const osPlayers = trans.objectStore('players');
      const reqPlayers = osPlayers.getAll();

      reqPlayers.onsuccess = () => {
        res(reqPlayers.result);
      };
    });
  }

  async readGames(): Promise<Game[]> {
    return new Promise<Game[]>((res) => {
      if (this.db == null) {
        throw new Error('no IndexDB');
      }
      const trans = this.db.transaction(['games']);
      const osGames = trans.objectStore('games');
      const reqGames = osGames.getAll();

      reqGames.onsuccess = () => {
        res(reqGames.result);
      };
    });
  }
}
