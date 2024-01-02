# Al-An OSS

Al-An OSS is an open source Discord bot, focused on utility, minimalism, and providing alternatives to similar closed-source bots.

## Features

* Supports text and slash commands
* Extendable, minimal plugin architecture
* Optional Revolt support via [Reflectcord](https://github.com/V3L0C1T13S/reflectcord)
* Conversational AI
* Character-based AI, similar to character.ai
* Audio transcription powered by whisper.cpp
* Music recognition via AuDD or ACRCloud
* Multiple AI and DB backends

## Setup

Setting up Al-An OSS is made to be easy, and requires only NodeJS and pnpm to run (albeit at a very basic level)

Simply clone the repository, and create a file named ".env" with these contents:
```
DISCORD_TOKEN=YOUR_TOKEN
```
Replace YOUR_TOKEN with the token for your Discord bot. If you don't know what a bot token is yet, you should probably look [here](https://discord.com/developers) before proceeding.

Once you've setup a .env file, you can now install the dependencies for the bot by running this command:
```
pnpm i
```
Finally, you can start the bot by running:
```
pnpm start
```
Congrats! You should now be hosting your own instance of Al-An OSS, and can begin playing with its features.
