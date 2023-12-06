# playlist manager

firefox extension that combines playlists across different sites

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
1. On Firefox, go to `about:debugging#/runtime/this-firefox`
1. Click on `Load Temporary Add-on...`
1. Select `manifest.json` from the generated build folder
1. You will have to repeat this process every time Firefox is restarted

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
