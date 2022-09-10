import { Client } from "@theuntraceable/discord-rpc"
import config from "../config.json" assert {type: "json"}
import settings from "./settings.json" assert {type: "json"}
import { load } from "./utils/load.js"

const client = new Client({
    transport: "ipc"
})

client.settings = settings
client.channels = {}
client.commands = {}
client.users = {}

client.addCommand = (name, callback) => {
    client.commands[name] = callback
    return client
}

client.captureRejections = true

await load(client)

const loginOptions = {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    scopes: ["rpc","messages.read", "rpc.notifications.read", "rpc.voice.read"],
    redirectUri: "https://discord.com"
}

if(client.settings.token) {
    if(new Date(client.settings.token.expiresAt) > Date.now()) {
        loginOptions.accessToken = client.settings.token.accessToken
    }
}

client.login(loginOptions)