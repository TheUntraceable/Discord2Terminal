import { Client } from "@theuntraceable/discord-rpc"
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import config from "../config.json" assert {type: "json"}
import inquirer from "inquirer"
import { createSpinner } from "nanospinner"
import chalk from "chalk"
import fs from "fs"

marked.setOptions({
    renderer: new TerminalRenderer( )
});

const client = new Client({
    transport: "ipc"
})

client.channels = {}
client.commands = {}


client.addCommand = (name, callback) => {
    client.commands[name] = callback
    return client
}


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
        console.log(chalk.red.underline(`Command not found!`))
        return await parseCommands()
    }
    await command(...args).catch(error => {
        console.error(chalk.red.underline(error))
    })
    return await parseCommands()
}

client.on("ready", async () => {
    let subscribed = 0
    const spinner = createSpinner("Subscribing to events to Discord...").start()
    const guilds = await client.getGuilds()
    client.guilds = guilds.guilds

    for(const guild of client.guilds) {
        const channels = await client.getChannels(guild.id)
        for(const channel of channels.filter(channel => channel.type == 0)) {
            client.channels[channel.id] = []
            await client.subscribe("MESSAGE_CREATE", { channel_id: channel.id })
            subscribed++
        }
    }
    spinner.success({
        text: `Subscribed to MESSAGE_CREATE for ${subscribed}/${Object.keys(client.channels).length} channels!`
    })
    await parseCommands()
})

client.on("MESSAGE_CREATE", async payload => {
    payload.message.content = marked(payload.message.content) 
    client.channels[payload.channel_id].push(payload.message)
})

client.addCommand("cls", async () => {
    console.clear()
}).addCommand("eval", async (code = "") => {
    await eval(code)
}).addCommand("clear", async () => {
    console.clear()
})

for(const file of fs.readdirSync("./commands")) {
    const spinner = createSpinner(`Loading command ${file}...`).start()
    const command = await import(`./commands/${file}`)
    client.addCommand(command.name, command.callback)
    spinner.success({
        text: `Loaded command ${file}!`
    })
}

client.login({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    scopes: ["rpc", "identify", "messages.read"],
    redirectUri: "https://discord.com"
})