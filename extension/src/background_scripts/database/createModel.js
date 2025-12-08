import { dexie } from "./dexie";
import { Field } from "./Field";

/**
 * fields is an object where the key is the field name and the value is an options object.
 * all the boolean options are false by default.
 * any prop used to filter, sort, etc should be indexed.
 * isUnique and isIndexed will be ignored on the primary key.
 * an array probably cannot be unique...
 * @param {string} name
 * @param {{ [s: string]: { type: string, isIndexed?: boolean, isPrimaryKey?: boolean, isUnique?: boolean, isArray?: boolean } }} [fields]
 */
export function createModel(name, fields) {
  if (dexie.models[name]) throw Error(`A model with ${name} already exists.`);

  const newModel = class Model {
    static get model() {
      return dexie.db[name];
    }

    static fields = Object.entries(fields).reduce((acc, [name, options]) => {
      acc[name] = new Field({ name, ...options });
      return acc;
    }, {});

    static get indexedProps() {
      return Object.values(this.fields)
        .sort((a, b) => (b.isPrimaryKey ? 1 : 0) - (a.isPrimaryKey ? 1 : 0)) // put the primary key first
        .map((f) => f.indexedProps)
        .filter((p) => p !== null)
        .join(", ");
    }

    /**
     * helper function for findOne, findAll, modify, etc. builds the selection part of the query.
     * @param {{ [key: string]: { value: any | any[], exclude: any | any[], ignoreCase?: boolean } | any | any[] }} filters
     */
    static _select(filters) {
      // no fields given; select entire table
      if (!filters || Object.keys(filters).length === 0) {
        const query = this.model;
        return query;
      }

      // convert all filters from whatever format they were given in
      // to { key, value, isArray, exclude: boolean, ignoreCase }
      // remove any values that are undefined
      const search = Object.entries(filters)
        .filter(([key, value]) => value !== undefined)
        .flatMap(([key, value]) => {
          const DEFAULTS = { exclude: false, ignoreCase: false };
          // if it's not an object, fill in with defaults
          if (typeof value !== "object" || Array.isArray(value)) {
            return [{ ...DEFAULTS, value, isArray: Array.isArray(value), key }];
          }

          // if i have both value and exclude, split this up into two filters
          if (value.value !== undefined && value.exclude !== undefined)
            return [
              {
                ...DEFAULTS,
                ...value,
                value: value.value,
                exclude: false,
                isArray: Array.isArray(value.value),
                key,
              },
              {
                ...DEFAULTS,
                ...value,
                value: value.exclude,
                exclude: true,
                isArray: Array.isArray(value.exclude),
                key,
              },
            ];

          // otherwise just fill in missing keys
          return [
            {
              ...DEFAULTS,
              ...value,
              isArray: Array.isArray(value.value),
              key,
            },
          ];
        });

      let query = this.model;

      // get the first field and query the db
      const { key, value, ...other } = search.shift();
      const field = this.fields[key];
      query = field.addToQuery(query, { value, ...other });

      // now apply all other filters as in-memory
      search.forEach(({ key, value, ...other }) => {
        const field = this.fields[key];
        query = field.addToQueryInMemory(query, { value, ...other });
      });

      return query;
    }

    /** find a document by the primary key */
    static async findById(id) {
      return await this.model.get(id);
    }

    /**
     * find a document by any number of fields.
     * only the first field uses the db index, the others are filtered in memory;
     * so put the most restrictive filter first.
     * the first field must be indexed, but the others don't have to be.
     * each field must be an object, the key is the field name and the value is
     * either a string value to be matched, an array of values, or an options object.
     * ignoreCase is false by default.
     * @param {{ [key: string]: { value: any | any[], exclude: any | any[], ignoreCase?: boolean } | any | any[] }} filters
     */
    static async findOne(filters) {
      let query = this._select(filters);
      return await query.first();
    }

    /**
     * find all documents that match filters
     * only the first field uses the db index, the others are filtered in memory;
     * so put the most restrictive filter first.
     * the first field must be indexed, but the others don't have to be.
     * each field must be an object, the key is the field name and the value is
     * either a string value to be matched, an array of values, or an options object.
     * ignoreCase is false by default.
     * @param {{ [key: string]: { value: any | any[], exclude: any | any[], ignoreCase?: boolean } | any | any[] }} filters
     * @param {{ orderBy?: string }} options
     */
    static async findAll(filters = {}, options = {}) {
      let query = this._select(filters);

      if (options.orderBy) {
        query = query.orderBy(options.orderBy);
      }

      return await query.toArray();
    }

    /**
     * @param {{ [key: string]: any; }} filters
     * @param {(data: any) => any} callback
     */
    static async modify(filters, callback) {
      let query = this._select(filters);
      return await query.modify(callback);
    }

    constructor(data) {
      this.data = data;
    }

    set(fields) {
      this.data = { ...this.data, ...fields };
    }

    async save() {
      return await dexie.models[name].put(this.data);
    }

    async delete() {
      return await dexie.models[name].delete(this.data.id);
    }
  };

  // store this model class...
  dexie.models[name] = newModel;

  return newModel;
}
