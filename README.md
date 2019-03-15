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

KatBot uses the module [dotenv](https://www.npmjs.com/package/dotenv) to securely manage environment variables. All environment variables should be placed in a local `.env` file copied from sample env file [env.example](./env.example) (comments in this example file further describe the purpose of each variable). The `.env` file is ignored by Git and should remain **local-only**.

## Contribution

Please follow these guidelines when contributing to the bot. Thank you!

### Code style

All source code should be run through [Prettier](https://prettier.io) with the option `--single-quote`
