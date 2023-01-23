import { Client } from "@theuntraceable/discord-rpc"
import { REST } from "discord.js"
import fs from "fs/promises"
// import config from "../config.json" assert {type: "json"}
// import settings from "./settings.json" assert {type: "json"}
import load from "./utils/load.js"
import { QuickDB, SqliteDriver } from "quick.db"

let config;

try {
    config = JSON.parse(await fs.readFile("./config.json", "utf8"))
} catch(error) {
    console.error("Please create a config.json file with your client ID and secret.")
    process.exit(1)
}

let settings;

try {
    settings = JSON.parse(await fs.readFile("./settings.json", "utf8"))
} catch(error) {
    settings = {}
    await fs.writeFile("./settings.json", JSON.stringify(settings, null, 4))
}

const client = new Client({
    transport: "ipc"
})

client.db = new QuickDB({
    driver: new SqliteDriver("./database.sqlite"),
    filePath: "./database.sqlite"
})

client.channels = client.db.table("channels")
client.users = client.db.table("users")
client.tags = client.db.table("tags")

client.settings = settings
client.commands = {}
client.rest = new REST({ version: "10" }).setToken(config.clientToken)

client.addCommand = (name, callback) => {
    client.commands[name] = callback
    return client
}

client.captureRejections = true

await load(client)

const loginOptions = {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    scopes: ["rpc","messages.read", "rpc.notifications.read", "rpc.voice.read", "identify"],
    redirectUri: "https://discord.com"
}

if(client.settings.token) {
    if(new Date(client.settings.token.expiresAt) > Date.now()) {
        loginOptions.accessToken = client.settings.token.accessToken
    }
}

client.login(loginOptions).catch(async error => {
    if(loginOptions.accessToken) {
        delete client.settings.token
        delete loginOptions.accessToken
        await fs.writeFile("./settings.json", JSON.stringify(client.settings, null, 4))
        // client.login(loginOptions)
        console.error(error)
    }
})
