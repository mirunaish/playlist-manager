# Playlist Manager

Firefox extension that combines playlists across different sites

## Features

- Combine songs on different platforms into a single playlist
- Search for a song on different platforms
- Simple 7-star rating system
- Tagging system and advanced filtering to get a playlist with the perfect vibe
- Save commonly used filters to Quickplay panel
- Create artist aliases so you can filter by person even if the name on the song is different
- Save song title and artist so you don't lose them if the video goes private or is deleted
- Control your playlist without switching tabs
- Avoid youtube "still watching?" popups
- Stop playing the playlist only after the current song finishes so you don't get distracted for 30 minutes more than you intended
- Save your spot in a playlist so you can resume it later even if you close the tab
- Customize the player theme for different playlists

### Supported sites

- Youtube
- Soundcloud
- Spotify (coming soon)
- Any other site that plays media can be saved to a playlist, with some features disabled

## Setup instructions

### Server

1. Run `cd server`

2. Install dependencies: `npm install`

3. Create database `playlists` using pgAdmin

4. Create file `.env` in the [`server`](server/) directory:

```
DATABASE_URL=postgres://user:password@localhost:5432/playlists
```

5. Migrate the database: `npm run migrate`

6. Run `npm run start`, or `run.sh` in the root directory

### Extension

1. Run `cd extension; npm run build`
2. On Firefox, go to `about:debugging#/runtime/this-firefox`
3. Click on `Load Temporary Add-on...`
4. Select `manifest.json` from the generated build folder
5. You will have to repeat steps 2-4 every time Firefox is restarted

## Tech Stack

- Backend
  - JavaScript
  - Node
  - Express
  - PostgreSQL
  - Sequelize
  - dotenv
- Frontend
  - React
  - [Create React App](https://github.com/facebook/create-react-app)
  - [complex-browserext](https://www.npmjs.com/package/cra-template-complex-browserext) template
  - [React App Rewired](https://github.com/timarney/react-app-rewired)
  - Firefox extension API

## Sources

- [React extension tutorial](https://medium.com/swlh/bootstrapping-complex-chrome-firefox-edge-extensions-with-create-react-app-667be8df35d7)
- Documentation
  - [Express](https://expressjs.com/en/guide/routing.html)
  - [Sequelize](https://sequelize.org/docs/v6/)
  - [Firefox extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
  - [Webpack](https://webpack.js.org/concepts/) and [Babel](https://babeljs.io/docs/)
- StackOverflow
- [howtocenterincss](http://howtocenterincss.com/)
- [Youtube](https://commons.wikimedia.org/wiki/File:YouTube_Logo_2017.svg) and [Soundcloud](https://commons.wikimedia.org/wiki/File:Soundcloud_logo.svg) logos from Wikimedia
