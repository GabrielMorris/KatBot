# KatBot

A bot that serves to appreciate the very best of us

## Installation

KatBot runs on [node.js](https://nodejs.org) and dependencies can be installed via [npm](https://www.npmjs.com/get-npm)

```
npm ci
```

(Using `npm ci` installs from the package lockfile and ensures that dependencies have consistent versions across environments.)

### Configuration

(See next section on environment variables for managing the bot's environment variables securely with [dotenv](https://www.npmjs.com/package/dotenv))

KatBot connects to a [MongoDB](https://docs.mongodb.com) server for data storage; you must configure database credentials prior to use via environment variables `DB_USER` and `DB_PASS`

You must also provide a Discord bot token in the environment variable `TOKEN`

### Environment variables

KatBot uses the module [dotenv](https://www.npmjs.com/package/dotenv) to securely manage environment variables. All environment variables should be placed in a local `.env` file (copied from sample env file [env.example](./env.example)); this file is ignored by Git and should remain **local-only**.

#### List of environment variables used

| Name | Description |
| ---- | ----------- |
| DB_URL | Database connection URL |
| DB_USER | Database username |
| DB_PASS | Database password |
| TOKEN | Discord bot token |
| GAME_CHANNELS | Discord Channel IDs (separated by semicolon) this bot runs on |
| GAME_MASTERS | Discord User IDs (separated by semicolon) to grant game admin status to |

## Contribution

Please follow these guidelines when contributing to the bot. Thank you!

### Code style

All source code should be run through [Prettier](https://prettier.io) with the option `--single-quote`
