# Discord2Terminal
## What is this?
Have you ever wanted to use Discord? Have you ever wanted to code? Are you in a load of servers? Is Discord becoming a distraction? Have you wanted to use Discord as a CLI without having to selfbot? I'm here to solve that!
This uses DiscordRPC to cache messages in each channel, and then displays them back to you in the terminal, in an attractive way too! But, that doesn't solve having Discord in the Terminal... Well, I thought the same thing, and I got a solve for that too! Check the Bot folder!
The bot folder contains a Discord bot integrated with an ExpressJS server. What it does is lets server admins (or people with the `MANAGE_WEBHOOKS` permission) to create webhooks. The bot then saves the information of the webhooks in its database, this avoids the bot from using a webhook you have setup for something else!
After this, in the Client, Soon, you will be able to send messages!
### Isn't that a security threat?
It *would* be, if I didn't mask it via my API. The flow of things is:
1. You send a message in the terminal
2. There is a request to **my API**
3. My API will find an available webhook in that channel\*
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
After that, **make sure you have Discord open.**, you can go to the Client folder, and run `node .` to start the client. It will open up Discord, and you will be prompted to authorize the app. Once that all happens, spend the rest of your day in the command line!