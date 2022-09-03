import { Client } from "@theuntraceable/discord-rpc"
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import config from "../config.json" assert {type: "json"}
import inquirer from "inquirer"
import { createSpinner } from "nanospinner"
import chalk from "chalk"
import fs from "fs"

marked.setOptions({
    renderer: new TerminalRenderer()
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

client.captureRejections = true

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

const commandSpinner = createSpinner("Loading commands...").start()

client.addCommand("cls", async () => {
    console.clear()
}).addCommand("eval", async (code = "") => {
    await eval(code)
}).addCommand("clear", async () => {
    console.clear()
})

commandSpinner.success({
    text: `Loaded ${Object.keys(client.commands).length} commands!`
})

for(const file of fs.readdirSync("./commands")) {
    const spinner = createSpinner(`Loading command ${file}...`).start()
    const command = await import(`./commands/${file}`)
    client.addCommand(command.name, command.callback)
    spinner.success({
        text: `Loaded command ${file}!`
    })
}

const eventSpinner = createSpinner("Loading events...").start()
let events = 0

for(const file of fs.readdirSync("./events")) {
    const spinner = createSpinner(`Loading event ${file}...`).start()
    const event = await import(`./events/${file}`)
    client.on(event.name, event.callback)
    events++
    spinner.success({
        text: `Loaded event ${file}!`
    })
}

eventSpinner.success({
    text: `Loaded ${events} events!`
})

client.login({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    scopes: ["rpc", "identify", "messages.read"],
    redirectUri: "https://discord.com"
})