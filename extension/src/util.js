export function shortenTitle(title) {
  if (title.length > 25) {
    title = title.slice(0, 25).trim() + "...";
  }
  return title;
}
