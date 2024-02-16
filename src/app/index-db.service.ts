import { Injectable } from '@angular/core';
import { Game } from './interfaces';
import { Player } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class IndexDBService {
  private db: IDBDatabase | null = null;

  constructor() {}

  reset() {
    this.db?.close()
    let delet = window.indexedDB.deleteDatabase('appState');

    delet.onerror = (ev) => console.error(ev.target);
    delet.onsuccess = (ev) => {
      this.initDB();
    };
  }

  saveGame(newGame: Game) {
    if (this.db != null) {
      const trans = this.db.transaction('games', 'readwrite');
      trans.objectStore('games').add(newGame);
    } else {
      console.error('no IDBDatabase');
    }
  }

  savePlayer(newPlayer: Player) {
    if (this.db != null) {
      const trans = this.db.transaction('players', 'readwrite');
      trans.objectStore('players').add(newPlayer);
    } else {
      console.error('no IDBDatabase');
    }
  }

  async initDB(): Promise<void> {
    let request = indexedDB.open('appState', 2);

    request.onerror = (ev) => console.error(ev.target);
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

    const success = new Promise<void>((res) => {
      request.onsuccess = () => {
        this.db = request.result;
        res();
      };
      request.onerror = () => {
        throw new Error("dbInit failed")
      };
    });
    return success;
  }

  async readPlayers(): Promise<Player[]> {
    return new Promise<Player[]>((res, rej) => {
      if (this.db == null) {
        throw new Error('no IndexDB');
      }
      const trans = this.db.transaction(['players']);
      const osPlayers = trans.objectStore('players');
      const reqPlayers = osPlayers.getAll();

      reqPlayers.onsuccess = (event) => {
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

      reqGames.onsuccess = (event) => {
        res(reqGames.result);
      };
    });
  }
}
