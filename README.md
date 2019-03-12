# KatBot

A bot that serves to appreciate the very best of us

## Installation

KatBot runs on [node.js](https://nodejs.org) and dependencies can be installed via [npm](https://www.npmjs.com/get-npm)

```
npm install
```

KatBot connects to a [MongoDB](https://docs.mongodb.com) server for data storage; you must configure database credentials prior to use via environment variables `DB_USER` and `DB_PASS` - see next section on configuration for managing the bot's environment variables securely

### Configuration

KatBot uses the module [dotenv](https://www.npmjs.com/package/dotenv) to securely manage environment variables. All environment variables should be placed in a local `.env` file (copied from sample env file [env.example](./env.example)); this file is ignored by Git and should remain **local-only**.

Sample .env file contents:

```
DB_USER=sampleDatabaseUsername
DB_PASS=sampleDatabasePassword
```

#### List of environment variables used

| Name | Description |
| ---- | ----------- |
| DB_USER | Database username |
| DB_PASS | Database password |

## Code style

All source code should be run through [Prettier](https://prettier.io) with the option `--single-quote`
