# playlist manager

firefox extension that combines playlists across different sites

## Setup instructions

### Server

1. Install dependencies: `npm install`

2. Create database `playlists` using pgAdmin

3. Replace `<user>` and `<password>` in the [`.env`](server/.env) file with your postgreSQL credentials

4. Migrate the database: `npm run migrate`

5. Run `npm run start`

### Extension

1. On Firefox, go to `about:debugging#/runtime/this-firefox`
2. Click on `Load Temporary Add-on...`
3. Select [`manifest.json`](extension/manifest.json)
4. You will have to repeat this process every time Firefox is restarted

## Tech Stack

- Backend
  - JavaScript
  - Node
  - Express
  - PostgreSQL
  - Sequelize
  - dotenv
- Frontend
  - JavaScript
  - Firefox extension API
  - HTML

## Sources

- Documentation
  - [Express](https://expressjs.com/en/guide/routing.html)
  - [Sequelize](https://sequelize.org/docs/v6/)
  - [Firefox extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- StackOverflow
