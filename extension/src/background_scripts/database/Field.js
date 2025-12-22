export class Field {
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
              (doc) => doc[this.name].toLowerCase() === value.toLowerCase()
            )
          : query.and((doc) => doc[this.name] === value);
      else
        return ignoreCase
          ? query.and(
              (doc) => doc[this.name].toLowerCase() !== value.toLowerCase()
            )
          : query.and((doc) => doc[this.name] !== value);
    }

    // the field is a single value, i'm searching for any of the values in the array
    if (!this.isArray && isArray) {
      return exclude
        ? query.and((doc) => !value.includes(doc[this.name]))
        : query.and((doc) => value.includes(doc[this.name]));
    }

    // the field is an array and i'm searching for one value in it
    if (this.isArray && !isArray) {
      return exclude
        ? query.and((doc) => !doc[this.name].includes(value))
        : query.and((doc) => doc[this.name].includes(value));
    }

    // both the field and the value i'm searching for are arrays
    if (this.isArray && isArray) {
      return exclude
        ? query.and((doc) => doc[this.name].some((v) => value.includes(v)))
        : query.and((doc) => !doc[this.name].some((v) => value.includes(v)));
    }

    return query;
  }
}
