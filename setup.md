# Setup

## Requirements

[NodeJS 18 or higher](https://nodejs.org)
[Git](https://git-scm.com/)

## Setting up

### Prequisites

#### Downloading Alan OSS

To obtain the sources for Alan OSS, run the following command: `git clone https://github.com/V3L0C1T13S/alan-oss`

#### Dependencies

1. Enable the pnpm package manager by running `corepack enable pnpm` in your terminal.

2. Run `pnpm i` in the directory you cloned Alan OSS to.

### Setting up environment variables

In order to actually connect to Discord, you will have to create an application at the [Discord Developer Portal](https://discord.com/developers), and a corresponding bot user for it.

Once you have created a bot, obtain its token and copy the "example.env" file as just ".env"

Open the file up, and change the DISCORD_TOKEN variable to your bots newly created token.

### Building and running

If you made it this far, congrats! You're on the final step.

To build and run Alan OSS, run the following commands in your terminal:

1. Compile Alan OSS: `pnpm run build`

2. Run Alan OSS: `pnpm start`

OR

Run Alan OSS directly from source by using `pnpm run start:dev`
