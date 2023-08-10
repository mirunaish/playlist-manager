// strip urls from supported sites
export const stripUrls = (req, res, next) => {
  function stripURL(url) {
    if (url.includes("youtube")) {
      // remove everything after the first argument
      url = url.replace(/&.*$/, "");
    }
    return url;
  }

  if (req.body?.url) {
    req.body.url = stripURL(req.body.url);
  }
  if (req.query?.url) {
    req.query.url = stripURL(req.query.url);
  }

  next();
};
