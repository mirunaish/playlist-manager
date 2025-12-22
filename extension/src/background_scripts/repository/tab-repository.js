import { Tabs } from "../models";

/** get tabs sorted by index */
async function getAllTabs() {
  const tabs = await Tabs.findAll();
  return tabs.map((t) => t.data).sort((a, b) => a.index - b.index);
}

async function getAudibleTabs() {
  const tabs = await Tabs.findAll({ audible: true });
  return tabs.map((t) => t.data);
}

async function getTabById(id) {
  const tab = await Tabs.findById(id);
  return tab.data;
}

async function getActiveTab() {
  const tab = await Tabs.findOne({ active: true, currentWindow: true });
  return tab.data;
}

async function createTab(tabData) {
  const tab = new Tabs(tabData);
  await tab.save();
  return tab.data;
}

async function makeTabActive(id) {
  const tab = await Tabs.findById(id);
  if (!tab) throw new Error("couldn't find tab with id " + id);

  // make tab active and window focused
  tab.set({ active: true, window: { focused: true } });
  await tab.save();
}

async function changeTabUrl(id, url) {
  const tab = await Tabs.findById(id);
  if (!tab) throw new Error("couldn't find tab with id " + id);
  tab.set({ url });
  await tab.save();
}

async function closeTab(id) {
  const tab = await Tabs.findById(id);
  await tab.delete();
}

export const tabRepository = {
  getAllTabs,
  getAudibleTabs,
  getTabById,
  getActiveTab,
  createTab,
  makeTabActive,
  changeTabUrl,
  closeTab,
};
