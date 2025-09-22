import { getBrowser } from "../util";

export class Tabs {
  static tabs = getBrowser().tabs;

  static async findById(id) {
    return new Tabs({}, await this.tabs.get(id));
  }

  static async findAll(filter) {
    return (await this.tabs.query(filter)).map((tab) => new Tabs({}, tab));
  }

  static async findOne(filter) {
    const all = await this.findAll(filter);
    if (all.length === 0) return null;
    return all[0];
  }

  constructor(data = {}, tab = null) {
    this.tempData = data; // to be merged into tab on save()
    this.tab = tab;
  }

  get data() {
    return { ...(this.tab ?? {}), ...this.tempData };
  }

  set(data) {
    this.tempData = { ...this.tempData, ...data };
  }

  async save() {
    // separate out window data for an update later
    const { window, ...newData } = this.tempData;

    if (this.tab === null) {
      // if tab is still null, need to create the tab
      this.tab = await Tabs.tabs.create(newData);
    } else {
      // otherwise just merge all data from data into the tab
      this.tab = await Tabs.tabs.update(this.tab.id, newData);
    }

    // if window was given, update the window
    if (window) {
      await getBrowser().windows.update(this.tab.windowId, window);
    }

    // finally, discard temp data
    this.tempData = {};

    return this.tab;
  }

  async delete() {
    if (this.tab === null) return;
    try {
      await Tabs.tabs.remove(this.tab.id);
    } catch (e) {
      // tab was probably already closed, ignore
    }

    this.tab = null;
  }
}
