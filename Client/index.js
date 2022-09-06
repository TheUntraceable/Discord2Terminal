import { Client } from "@theuntraceable/discord-rpc"
import config from "../config.json" assert {type: "json"}
import settings from "./settings.json" assert {type: "json"}
import { createSpinner } from "nanospinner"
import fs from "fs"

const client = new Client({
    transport: "ipc"
})

client.channels = {}
client.commands = {}
client.users = {}

if(!settings) {} // TODO

client.addCommand = (name, callback) => {
    client.commands[name] = callback
    return client
}

client.captureRejections = true

const commandSpinner = createSpinner("Loading commands...").start()

client.addCommand("cls", async () => {
    console.clear()
}).addCommand("eval", async (code = "") => {
    eval(code)
}).addCommand("clear", async () => {
    console.clear()
})

for(const file of fs.readdirSync("./commands")) {
    const spinner = createSpinner(`Loading command ${file}...`).start()
    const command = await import(`./commands/${file}`)
    const callback = async (...args) => {
        await command.data.callback(client, ...args)
    }
    client.addCommand(command.data.name, callback)
    spinner.success({
        text: `Loaded command ${file}!`
    })

}

commandSpinner.success({
    text: `Loaded ${Object.keys(client.commands).length} commands!`
})

const eventSpinner = createSpinner("Loading events...").start()
let events = 0

for(const file of fs.readdirSync("./events")) {
    const spinner = createSpinner(`Loading event ${file}...`).start()
    const event = await import(`./events/${file}`)
    
    client.on(event.data.name, async payload => {
        payload.client = client
        await event.data.callback(payload).catch(console.error)
    })
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
    scopes: ["rpc","messages.read", "rpc.notifications.read", "rpc.voice.read"],
    redirectUri: "https://discord.com"
})