# Discord2Terminal
## What is this?
![Demo](/docs/TerminalGif.gif)

Have you ever wanted to use Discord? Have you ever wanted to code? Are you in a load of servers? Is Discord becoming a distraction? Have you wanted to use Discord as a CLI without having to selfbot? I'm here to solve that!

This uses DiscordRPC to cache messages in each channel, and then displays them back to you in the terminal, in an attractive way too! 
But, that doesn't solve having Discord in the Terminal... 
Well, I thought the same thing, and I got a solve for that too! Check the Bot folder!
The bot folder contains a Discord bot integrated with an ExpressJS server. What it does is lets server admins (or people with the `MANAGE_WEBHOOKS` permission) to create webhooks. The bot then saves the information of the webhooks in its database, this avoids the bot from using a webhook you have setup for something else!
After this, in the Client, you will be able to send messages!
### Isn't that a security threat?
It *would* be, if I didn't mask it via my API. The flow of things is:
1. You send a message in the terminal
2. There is a request to **the API** the Bot folder contains
3. The API will find an available webhook in that channel\*
4. Your message wil be sent\*\*

\* An "available webhook" means that it is not ratelimited, and is for the currently selected channel.

\*\* The sending of the message may be delayed if it cannot find an available webhook.
## How do I use it?
### Client
Run the commands below.
```bash
git clone https://github.com/TheUntraceable/Discord2Terminal.git
cd Discord2Terminal/
npm i
```
After you run these commands, you need to do a little setup.
1. Go and create a Discord Application.
2. Go to the Bot tab, and create a bot, and copy down the client secret, and token
3. Go to the application tab, and copy the application id.
4. Create any redirect url, this is not used at all so it can point to google if you want. **Do not make this empty as it will crash Discord!**

Create a `config.json` file, with contents looking like:
```jsonc
{
    "mongoUri": "The URL to a MongoDB Cluster.", // this is optional, and is only used by the backend which you shouldn't need to run
    "clientId": "Your client ID",
    "clientSecret": "Client secret here", 
    "clientToken": "token",
    "port": 8000 // This is optional, its for the API which I will run for you.

}
```
After that, **make sure you have Discord as an app open.**, you can go to the Client folder, and run `node .` to start the client. It will open up Discord, and you will be prompted to authorize the app. Once that all happens, spend the rest of your day in the command line!

## Commands
Below will be a table of commands. 

Arguments are separated by a comma **in the documentation**, you would pass in `command arg1 arg2` normally.

If an argument ends with a `?`, it means that it is optional.

Partial means that the argument will filter values to show you, by the `list.filter(item => item.includes(argument))`.


| Command Name | Description | Arguments | Output Description |
| :----------- | :---------: | :-------: | -----------------: |
| select       | View messages in a channel | Partial Server Name?, Partial Channel Name? | The messages in that channel displayed nicely |
| snipe | View deleted messages in a channel | Partial Server Name?, Partial Channel Name? | The deleted messages in that channel displayed nicely |
| send | Send a message in a channel | Partial Server Name?, Partial Channel Name? | Nothing if successful |
| purge | Clear the cache of messages or users | None | A message showing what you deleted |
| clear | Clear the terminal | None | Nothing |
| cls | Clear the terminal | None | Nothing |
| eval | Evaluate JavaScript | JavaScript | Anything |
| join | Join a voice channel | Partial Server Name?, Partial Channel Name? | Success message |
| leave | Leave a voice channel | None | Nothing |
| watch | Get messages from a channel in real time | Partial Server Name?, Partial Channel Name? | Messages from that channel in real time