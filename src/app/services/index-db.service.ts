import { Injectable } from '@angular/core';
import { Game } from '../interfaces';
import { Player } from '../interfaces';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IndexDBService {
  private db: IDBDatabase | null = null;

  constructor() { }

  async reset(): Promise<boolean> {
    return new Promise<boolean>((res,rej) => {
      this.db?.close()
      let delet = window.indexedDB.deleteDatabase('appState');
      delet.onerror = (ev) => { throw Error(JSON.stringify(ev)) };
      delet.onsuccess = () => {
        console.log("DeleteIndexDb")
        this.initDB().then(() => res(true)).catch((e) => rej(e))
      };
    })
  }

  async saveGame(newGame: Game): Promise<boolean> {
    return new Promise((res, rej) => {
      if (this.db != null) {
        const trans = this.db.transaction('games', 'readwrite');
        let req = trans.objectStore('games').add(newGame);
        req.onerror = () => rej("save Game Failed")
        req.onsuccess = () => res(true)
      } else {
        throw throwError(() => "no IndexDB")
      }
    })
  }

  async savePlayer(newPlayer: Player): Promise<boolean> {
    return new Promise((res, rej) => {
      if (this.db != null) {
        const trans = this.db.transaction('players', 'readwrite');
        let req = trans.objectStore('players').add(newPlayer);
        req.onerror = (ev) => rej("save Player Failed" + ev.target)
        req.onsuccess = () => res(true);
      } else {
        throw throwError(() => "no IndexDB")
      }
    })
  }

  async replacePlayer(newPlayer: Player): Promise<boolean>{
    return new Promise(()=> {
      if (this.db != null) {
        const trans = this.db.transaction('players', 'readwrite');
        let req = trans.objectStore('players').getAll()
        req.onsuccess = () => {
          let myres = req.result as Player[]
          let oldKey = myres.find(x=> x.name == newPlayer.name)?.name
          if (oldKey != null) {
            trans.objectStore('players').delete(oldKey)
            this.savePlayer(newPlayer)
          }else{throw Error}
        }
      }
    })
  }

  async initDB(): Promise<void> {
    return new Promise((res) => {
      let request = indexedDB.open('appState', 2);
      request.onerror = (ev) => { throw Error(JSON.stringify(ev)) };

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
      request.onsuccess = () => { this.db = request.result; res(); }
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
