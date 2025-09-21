import Dexie from "dexie";

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

    this.db.version(4).stores(indexes);

    return await this.db.open();
  }
}

export const dexie = new DexieDatabase();

class Field {
  constructor({
    name,
    type = "string",
    isArray = false,
    isUnique = false,
    isIndexed = false,
    isPrimaryKey = false,
  }) {
    this.name = name;
    this.type = type;
    this.isPrimaryKey = isPrimaryKey;
    this.isArray = isArray;
    this.isUnique = isPrimaryKey ? true : isUnique;
    this.isIndexed = isPrimaryKey ? true : isUnique ? true : isIndexed;
  }

  get indexedProps() {
    if (!this.isIndexed) return null;
    return (this.isUnique ? "&" : "") + (this.isArray ? "*" : "") + this.name;
  }

  addToQuery(query, { value, exclude, ignoreCase, isArray }) {
    query = query.where(this.name);

    // the dexie methods are the same regardless of whether this field is an array or not

    if (!isArray) {
      // there's no case insensitive not equal
      if (exclude) return query.notEqual(value);
      else
        return ignoreCase ? query.equalsIgnoreCase(value) : query.equals(value);
    }

    if (isArray) {
      return exclude ? query.noneOf(value) : query.anyOf(value);
    }

    return query;
  }

  addToQueryInMemory(query, { value, exclude, ignoreCase, isArray }) {
    // both the field and the value i'm searching for are plain values, ie strings etc
    if (!this.isArray && !isArray) {
      if (exclude)
        return ignoreCase
          ? query.and(
              (object) =>
                object[this.name].toLowerCase() === value.toLowerCase()
            )
          : query.and((object) => object[this.name] === value);
      else
        return ignoreCase
          ? query.and(
              (object) =>
                object[this.name].toLowerCase() !== value.toLowerCase()
            )
          : query.and((object) => object[this.name] !== value);
    }

    // the field is a single value, i'm searching for any of the values in the array
    if (!this.isArray && isArray) {
      return exclude
        ? query.and((object) => !value.includes(object[this.name]))
        : query.and((object) => value.includes(object[this.name]));
    }

    // the field is an array and i'm searching for one value in it
    if (this.isArray && !isArray) {
      return exclude
        ? query.and((object) => !object[this.name].includes(value))
        : query.and((object) => object[this.name].includes(value));
    }

    // both the field and the value i'm searching for are arrays
    if (this.isArray && isArray) {
      return exclude
        ? query.and((object) =>
            object[this.name].some((v) => value.includes(v))
          )
        : query.and(
            (object) => !object[this.name].some((v) => value.includes(v))
          );
    }

    return query;
  }
}

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

  const model = class Model {
    static fields = Object.entries(fields).reduce((acc, [name, options]) => {
      acc[name] = new Field({ name, ...options });
      return acc;
    }, {});

    static get indexedProps() {
      return Object.values(this.fields)
        .map((f) => f.indexedProps)
        .filter((p) => p !== null)
        .join(", ");
    }

    /** find an object by the primary key */
    static async findById(id) {
      return await dexie[name].get(id);
    }

    /**
     * find an object by any number of fields.
     * only the first field uses the db index, the others are filtered in memory;
     * so put the most restrictive filter first.
     * the first field must be indexed, but the others don't have to be.
     * each field must be an object, the key is the field name and the value is
     * either a string value to be matched, an array of values, or an options object.
     * ignoreCase is false by default.
     * @param {{ [key: string]: { value: any | any[], exclude: any | any[], ignoreCase?: boolean } | any | any[] }} filters
     */
    static async findOne(filters) {
      // find all
      const all = await this.findAll(filters);
      // and return the first one
      return all.length > 0 ? all[0] : null;
    }

    /**
     * find all objects that match filters
     * only the first field uses the db index, the others are filtered in memory;
     * so put the most restrictive filter first.
     * the first field must be indexed, but the others don't have to be.
     * each field must be an object, the key is the field name and the value is
     * either a string value to be matched, an array of values, or an options object.
     * ignoreCase is false by default.
     * @param {{ [key: string]: { value: any | any[], exclude: any | any[], ignoreCase?: boolean } | any | any[] }} filters
     */
    static async findAll(filters) {
      // no fields given; return all data
      if (!filters || filters.length === 0) {
        return await dexie[name].toArray();
      }

      // convert all filters from whatever format they were given in
      // to { key, value, isArray, exclude: boolean, ignoreCase }
      // remove any values that are undefined
      const options = Object.entries(filters)
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

      let query = dexie[name];

      // get the first field and query the db
      const { key, value, ...option } = options.shift();
      const field = this.fields[key];
      query = field.addToQuery(query, { value, ...option });

      // now apply all other filters as in-memory
      options.forEach(({ key, value, ...option }) => {
        const field = this.fields[key];
        query = field.addToQueryInMemory(query, { value, ...option });
      });

      return await query.toArray();
    }

    constructor(data) {
      this.data = data;
    }

    set(fields) {
      this.data = { ...this.data, ...fields };
    }

    async save() {
      return await dexie[name].put(this.data);
    }

    async delete() {
      return await dexie[name].delete(this.data.id);
    }
  };

  // store this model class...
  dexie.models[name] = model;

  return model;
}
