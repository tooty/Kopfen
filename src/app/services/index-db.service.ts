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
  if (!this.db) {
    throw new Error('No IndexedDB instance available');
  }

  this.db.close();

  return new Promise((resolve, reject) => {
    const req = window.indexedDB.deleteDatabase('appState');

    req.onerror = (ev) => {
      reject(`IndexedDB deletion failed: ${ev.target}`);
    };

    req.onsuccess = async () => {
      console.log('Initiaalizing IndexedDB database');
      try {
        await this.initDB();
        resolve(true);
      } catch (initError) {
        reject(`IndexedDB initialization failed: ${initError}`);
      }
    };

    req.onblocked = () => {
      reject(new Error('IndexedDB deletion was blocked by another connection.'));
    };
  });
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
    return new Promise<boolean>((res)=> {
      if (this.db != null) {
        const trans = this.db.transaction('players', 'readwrite');
        let req = trans.objectStore('players').getAll()
        req.onsuccess = () => {
          let myres = req.result as Player[]
          let oldKey = myres.find(x=> x.name == newPlayer.name)?.name
          if (oldKey != null) {
            let mytrans = trans.objectStore('players').delete(oldKey)
              mytrans.onsuccess = (r)=>{
              this.savePlayer(newPlayer).catch(()=>{throw Error}).then(()=>
                res(true)
              )
            }
            mytrans.onerror = (e) => {throw Error(e.type)}
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
