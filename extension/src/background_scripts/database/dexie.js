import Dexie from "dexie";

const VERSION = 1;

class DexieDatabase {
  constructor() {
    this.db = new Dexie("playlists");
    this.models = {};
  }

  async open() {
    // register all the models that were created
    const indexes = Object.entries(this.models).reduce((acc, [name, model]) => {
      acc[name] = model.indexedProps;
      return acc;
    }, {});

    this.db.version(VERSION).stores(indexes);

    return await this.db.open();
  }

  async transaction(mode, tables, callback) {
    return await this.db.transaction(mode, tables, callback);
  }
}

export const dexie = new DexieDatabase();
