## Running locally
Create config.json to the root of the project. Structure should be like this:
```
{
  "token": "REPLACE_WITH_THE_REAL_DISCORD_BOT_TOKEN",
  "prefix": "!"
}
```

## Discord server setup
Create channel category: Active trades
Create channel: trade-requests

Set trade-requests channel's permissions so that everyone can read but only the bot can write.

## Running the bot
  
Run `npm start` to start the bot.

Invite the bot you channel(s) by opening this link with your bot's client_id: https://discord.com/api/oauth2/authorize?client_id=874372159957508096&permissions=34359814224&scope=bot+applications.commands

Bot requires `View Channel` and `Send Messages` permissions for planning. `Manage Roles` permission is required to enable game role subscribing for users. Game roles allows bot to notify people when a plan for certain game is published.

