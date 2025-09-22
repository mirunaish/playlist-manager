/**
 * create an in-memory model with one index
 * @param {string} key
 */
export function createCollection(key) {
  return class Collection {
    static documents = {}; // of type Collection
    static indexKey = key; // name of key that should be indexed

    static findAll() {
      return Object.values(this.documents).flatMap((doc) => Object.values(doc));
    }

    static findById(index) {
      return this.documents[index];
    }

    constructor(data) {
      this.data = data;
    }

    set(fields) {
      this.data = { ...this.data, ...fields };
    }

    save() {
      // ensure the document has the required key
      if (!this.data[Collection.indexKey])
        throw new Error(`Document is missing key ${Collection.indexKey}`);

      const index = this.data[Collection.indexKey];

      Collection.documents[index] = this;
    }

    remove() {
      const index = this.data[Collection.indexKey];

      delete Collection.documents[index];
    }
  };
}
