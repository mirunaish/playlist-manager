import { artistService } from "./artist-service";
import { tagService } from "./tag-service";
import { trackService } from "./track-service";

async function saveBackup() {
  const artists = Object.values(await artistService.getAllArtists());
  const tags = Object.values(await tagService.getAllTags());
  // const quickplay = await quickplayService.getAllQuickplay();
  const tracks = trackService.sortTracks(
    await trackService.getTracks({}),
    "addedAt",
    "ASC",
  ); // sort by added date

  return { artists, tags, tracks };
}

async function loadBackup(file) {
  const { artists, tags, tracks } = JSON.parse(await file.text());
  await artistService.loadArtists(artists);
  await tagService.loadTags(tags);
  await trackService.loadTracks(tracks);
}

export const backupService = {
  saveBackup,
  loadBackup,
};
