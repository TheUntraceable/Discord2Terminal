import http from "http"
import { Client, ChatInputCommandInteraction, InteractionType, PermissionsBitField, Routes, SlashCommandBuilder } from "discord.js"
import { verifyKeyMiddleware } from "discord-interactions"
import chalk from "chalk"
import { MongoClient } from 'mongodb';
import WebhookManager from "./webhookClient.js"
import express from "express"
import config from "../config.json" assert {type: "json"}
import got from "got";
import { Server } from "socket.io";

const app = express()
const client = new Client({intents: []})
const server = http.createServer(app)
const io = new Server(server) 

app.mongo = new MongoClient(config.mongoUri, { useNewUrlParser: true });
app.db = app.mongo.db("DiscordTerminal")
app.db.webhooks = app.db.collection("webhooks");
await app.mongo.connect();
app.webhookManagers = {}


const generateDatabaseEntry = async interaction => {
    if(!await interaction.client.db.webhooks.findOne({guildId: interaction.guild.id, channelId: interaction.channel.id})) {
        await interaction.client.db.webhooks.insertOne({
            guildId: interaction.guild.id,
            channelId: interaction.channel.id,
            webhooks: []
        });
    }
}

client.on("interactionCreate", async (interaction) => {
    if(interaction.type == InteractionType.ApplicationCommand) {
        await generateDatabaseEntry(interaction);
        if(interaction.commandName == "webhook") {
            const subcommand = interaction.options.getSubcommand()
            if(subcommand == "create") {
                await interaction.deferReply()
                interaction.reply = interaction.editReply
                if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageWebhooks)) {
                  return await interaction.editReply({content: "You do not have permission to create webhooks!"})
                }
                if (!interaction.appPermissions.has(PermissionsBitField.Flags.ManageWebhooks)) {
                  return await interaction.editReply({content: "I do not have permission to create webhooks!"})
                }

                const amount = interaction.options.getInteger("amount")

                let created = 0
                const existingWebhooks = (await interaction.channel.fetchWebhooks()).size
                if ((amount + existingWebhooks) > 10) {
                  return await interaction.editReply({content: "You cannot create more than 10 webhooks in a channel!"})
                }

                const webhooks = []
                while(amount >= created) {
                    try {
                        const webhook = await interaction.channel.createWebhook({reason: `Requested by ${interaction.member.user.tag} (${interaction.member.id})`, name: `2Terminal`})

                        const payload = {
                            webhookId: webhook.id,
                            webhookToken: webhook.token,
                            channelId: interaction.channel.id
                        }    
                        webhooks.push(payload)

                        created++
                    } catch(e) {
                        console.error(e)
                        await interaction.editReply({
                            content: `An error occurred while creating webhooks! You may have reached the limit of 10.`,
                        })
                    }

                } 

                const existing = await interaction.client.db.webhooks.findOne({channelId: interaction.channel.id})

                existing.webhooks.push(...webhooks)

                await interaction.client.db.webhooks.updateOne({channelId: interaction.channel.id}, {$set: {webhooks: existing.webhooks}})
                await interaction.editReply({content: `Created ${amount} webhooks!`})                                
            } else if(subcommand == "list") {
                const existing = await interaction.client.db.webhooks.findOne({guildId: interaction.guild.id})
                if (!existing.webhooks) {
                  return await interaction.reply({content: "No webhooks found!"})
                }
                await interaction.reply({content: `Found ${existing.webhooks.length} webhooks!`})
            } else if(subcommand == "delete") {
                const amount = interaction.options.getInteger("amount")
                const existing = await interaction.client.db.webhooks.findOne({guildId: interaction.guild.id})
                if (!existing.webhooks) {
                  return await interaction.reply({content: "No webhooks found!"})
                }
                if (amount > existing.webhooks.length) {
                  return await interaction.reply({content: "Not enough webhooks found!"})
                }
                existing.webhooks.splice(0, amount)
                await interaction.client.db.webhooks.updateOne({guildId: interaction.guild.id}, {$set: {webhooks: existing.webhooks}})
                await interaction.reply({content: `Deleted ${amount} webhooks!`})
            } else if(subcommand == "recommended") {
                const active = interaction.options.getInteger("active-users") || interaction.guild.memberCount
                return await interaction.reply({content: `I would recommend having ${((active / 5) + 1) > 10 ? 10 : (active / 5) + 1} webhooks for ${active} active users!`}) // 5 users per webhook allows for 1 message from each user
            }
        }
    }
})

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`)
    await client.rest.put(Routes.applicationCommands(client.user.id), {
        body: [
            new SlashCommandBuilder()
                .setName("webhook")
                .setDescription("Set up webhooks for this server for me to use!")
                .setDMPermission(false)
                .addSubcommand(option => 
                    option.setName("create")
                    .setDescription("Create webhooks for me to use!")
                    .addIntegerOption(option =>
                        option.setName("amount")
                        .setDescription("The amount of webhooks to create")
                        .setMaxValue(10)
                        .setRequired(true)
                    )
                )
                .addSubcommand(option => 
                    option.setName("list")
                    .setDescription("List the amount of webhooks I am using from this server")
                )
                .addSubcommand(option =>
                    option.setName("delete")
                    .setDescription("Delete webhooks from this server")
                    .addIntegerOption(option =>
                        option.setName("amount")
                        .setDescription("The amount of webhooks to delete")
                        .setRequired(true)
                        .setMaxValue(10)
                    )
                ).addSubcommand(option => 
                    option.setName("recommended")
                    .setDescription("Get the recommended amount of webhooks to create")
                    .addIntegerOption(option =>
                        option.setName("active-users")
                        .setDescription("The amount of active users in this server")
                    )
                )
        ]
    })
})

app.ratelimits = {}
app.users = {}

const checkRatelimits = async (req, res, next) => {
    if(!app.ratelimits[req.ip]) {
        app.ratelimits[req.ip] = {
            count: 0,
            timeoutCanceller: setTimeout(() => {
                delete app.ratelimits[req.ip]
            }, 10000)
        }
    }
    
    if(app.ratelimits[req.ip].count >= 5) {
        await res.status(429).send("You are being ratelimited!")
        return
    }
    app.ratelimits[req.ip].count++
    next()

}

app.post("/channels/:channelId/messages", express.json(), checkRatelimits, async (req, res) => {
    const dbEntry = await app.db.webhooks.findOne({channelId: req.params.channelId})
    if (!req.headers.authorization) {
      return res.status(401).send("No authorization header provided!")
    }
    if(!app.users[req.headers.authorization]) {
        const userData = await got.get("https://discord.com/api/v9/users/@me", {
            headers: {
                authorization: `${req.headers.authorization}`
            },
            throwHttpErrors: false
        }).json()
        if (!userData) {
          return res.status(401).send("Invalid authorization token provided!")
        }
        app.users[req.headers.authorization] = userData
    }

    const user = app.users[req.headers.authorization]
    console.log(dbEntry)
    if (!dbEntry || dbEntry.webhooks.size == 0) {
      return res.status(404).json({
            error: "No webhooks found for this channel!"
        })
    }
    const manager = app.webhookManagers[req.params.channelId] || new WebhookManager(dbEntry.webhooks)

    if(manager == new WebhookManager(dbEntry.webhooks)) {
        app.webhookManagers[req.params.channelId] = manager
    }

    const data = await manager.execute(await manager.findAvailableWebhook(), req.body.message, {username: user.username, avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`})
    res.status(200).json(data)
})

app.get("/channels/:channelId/messages", checkRatelimits, async (req, res) => {
    const {after} = req.query
    const channel = client.channels.cache.get(req.params.channelId) || await client.channels.fetch(req.params.channelId)
    if (!channel) {
      return res.status(404).json({
            error: "Channel not found!"
        })
    }
    const messages = await channel.messages?.fetch({after})
    res.status(200).json(messages)
})

app.state = new Set()

app.post("/auth/login", express.json(), async (req, res) => {
    const { token } = req.body
    if(app.state.has(token)) {
        return res.status(400).json({
            error: "Token already in use!"
        })
    }
    app.state.add(token)
    res.status(200).json({
        token
    })
})

app.post("/auth/logout", express.json(), async (req, res) => {
    const { token } = req.body
    if(!app.state.has(token)) {
        return res.status(400).json({
            error: "Token not in use!"
        })
    }
    app.state.delete(token)
    res.status(200).json({
        token
    })
})

io.on("connection", socket => {
    socket.on("auth", async token => {
        if(!app.state.has(token)) {
            socket.emit("auth", false)
            socket.disconnect()
        }
        socket.emit("ready")
    })
})

const PUBLIC_KEY = 'b220f5f6f864ea672b8b2b90cfbd646122673a65702d2c32148e0887181e544c';

app.post("/interactions", verifyKeyMiddleware(PUBLIC_KEY), async (req, res, next) => {
    const interaction = new ChatInputCommandInteraction(client, req.body)
    express.json()(req, res, next)
    interaction.reply = async (payload) => {
        return res.json({
            type: 4,
            data: payload
        })
    }
    interaction.deferReply = async () => {
        return res.json({
            type: 5
        })
    }
    client.emit("interactionCreate", interaction)
})

app.all('*', async (req, res) => {
    res.status(404).json({
        error: "Not found!"
    })
})

server.listen(config.port, () => {
    client.login(config.clientToken)
    console.log(chalk.green.underline(`Listening on port ${config.port}!`))
})