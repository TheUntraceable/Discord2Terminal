import { Client } from "@theuntraceable/discord-rpc"
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import config from "../config.json" assert {type: "json"}
import inquirer from "inquirer"
import { createSpinner } from "nanospinner"
import chalk from "chalk"

marked.setOptions({
    renderer: new TerminalRenderer( )
});
    

const client = new Client({
    transport: "ipc"
})

client.commands = {}


const parseCommands = async () => {
    const answer = await inquirer.prompt({
        type: "input",
        name: "command",
        message: "Enter a command"
    })
    const string = answer.command
    const commandName = string.split(" ")[0]
    const args = string.split(" ").filter(arg => arg !== "").splice(1, string.split(" ").length)
    const command = client.commands[commandName]

    if(!command) {
        console.log(chalk.red.underline(`Command ${command} not found!`))
        return await parseCommands()
    }
    await command(...args).catch(error => {
        console.error(chalk.red.underline(error))
    })
    return await parseCommands()
}

client.on("ready", async () => {
    const spinner = createSpinner("Subscribing to events to Discord...").start()
    const guilds = await client.getGuilds()
    client.guilds = guilds.guilds
    client.channels = {}

    for(const guild of client.guilds) {
        const channels = await client.getChannels(guild.id)
        for(const channel of channels) {
            client.channels[channel.id] = []
            client.subscribe("MESSAGE_CREATE", { channel_id: channel.id })
        }
    }
    spinner.success({
        text: `Subscribed to MESSAGE_CREATE for ${Object.keys(client.channels).length}!`
    })
    await parseCommands()
})

client.addCommand = (name, callback) => {
    client.commands[name] = callback
}

client.addCommand("select", async (guildString = "", channelString = "") => {
    const guilds = {}
    for(const guild of client.guilds) {
        guilds[guild.name] = guild
    }
    const answer = await inquirer.prompt({
        type: "list",
        name: "guild",
        message: "Select a guild",
        choices: Object.keys(guilds).filter(guild => guild.toLowerCase().includes(guildString.toLowerCase()))
    })
    const guild = guilds[answer.guild]
    const channels = await client.getChannels(guild.id)
    const channelNameToChannel = {}
    for(const channel of channels) {
        channelNameToChannel[channel.name.toLowerCase()] = channel
    }
    const channel = await inquirer.prompt({
        type: "list",
        name: "channel",
        message: "Select a channel",
        choices: channels.filter(channel => channel.type === 0 && channel.name.toLowerCase().includes(channelString.toLowerCase())).map(channel => channel.name)
    })

    var message = ""
    for(const cachedMessage of client.channels[channelNameToChannel[channel.channel].id]) {
        var messageBlock = chalk.hex(cachedMessage.author_color).underline(`${cachedMessage.author.username}#${cachedMessage.author.discriminator} (${cachedMessage.author.id})`)
        messageBlock += `\n    ${chalk.hex(cachedMessage.author_color)(cachedMessage.content)}`
        message += messageBlock
    }
    console.log(message)
})

client.addCommand("cls", async () => {
    console.clear()
})

client.addCommand("clear", async () => {
    console.clear()
})

client.on("MESSAGE_CREATE", async payload => {
    payload.message.content = marked(payload.message.content) 
    client.channels[payload.channel_id].push(payload.message)
})


client.login({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    scopes: ["rpc", "identify", "messages.read"],
    redirectUri: "https://discord.com"
})  