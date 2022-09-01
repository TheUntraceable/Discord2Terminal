const { Client, IntentsBitField, InteractionType, PermissionsBitField, Routes, SlashCommandBuilder } = require("discord.js")
const { MongoClient } = require('mongodb');
const WebhookManager = require("./webhookClient")
const express = require("express")
const config = require("../config.json");

const client = new Client({intents: [IntentsBitField.Flags.Guilds]});
const app = express()
app.use(express.json())

client.mongo = new MongoClient(config.mongoUri, { useNewUrlParser: true });
client.db = client.mongo.db("DiscordTerminal")
client.db.webhooks = client.db.collection("webhooks");
client.mongo.connect();
client.webhookManagers = {}


const generateDatabaseEntry = async interaction => {
    if(!await interaction.client.db.webhooks.findOne({guildId: interaction.guild.id})) {
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

                if(!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageWebhooks)) return await interaction.reply({content: "You do not have permission to create webhooks!"})
                if(!interaction.appPermissions.has(PermissionsBitField.Flags.ManageWebhooks)) return await interaction.reply({content: "I do not have permission to create webhooks!"})

                const amount = interaction.options.getInteger("amount")

                created = 0

                const webhooks = []

                while(amount >= created) {

                    const webhook = await interaction.guild.createWebhook({reason: `Requested by ${interaction.member.tag} (${interaction.member.id})`, name: `Discord2Terminal`})

                    const payload = {
                        webhookId: webhook.id,
                        webhookToken: webhook.token,
                        channelId: interaction.channel.id
                    }

                    webhooks.push(payload)
                } 
                const existing = await interaction.client.db.webhooks.findOne({channelId: interaction.channel.id})
                existing.webhooks.push(...webhooks)
                await interaction.client.db.webhooks.updateOne({channelId: interaction.channel.id}, {$set: {webhooks: existing.webhooks}})
                await interaction.reply({content: `Created ${amount} webhooks!`})                                
            } else if(subcommand == "list") {
                const existing = await interaction.client.db.webhooks.findOne({guildId: interaction.guild.id})
                if(!existing.webhooks) return await interaction.reply({content: "No webhooks found!"})
                await interaction.reply({content: `Found ${existing.webhooks.length} webhooks!`})
            } else if(subcommand == "delete") {
                const amount = interaction.options.getInteger("amount")
                const existing = await interaction.client.db.webhooks.findOne({guildId: interaction.guild.id})
                if(!existing.webhooks) return await interaction.reply({content: "No webhooks found!"})
                if(amount > existing.webhooks.length) return await interaction.reply({content: "Not enough webhooks found!"})
                existing.webhooks.splice(0, amount)
                await interaction.client.db.webhooks.updateOne({guildId: interaction.guild.id}, {$set: {webhooks: existing.webhooks}})
                await interaction.reply({content: `Deleted ${amount} webhooks!`})
            } else if(subcommand == "recommended") {
                const active = interaction.options.getInteger("active-users")
                return await interaction.reply({content: `I would recommend having ${active / 5} webhooks for ${active} active users!`}) // 5 users per webhook allows for 1 message from each user
            }
        }
    }
})

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`)
    await client.rest.put(Routes.applicationCommands(client.id), {
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

app.post("/channels/:channelId", async (req, res) => {

    const dbEntry = await client.db.webhooks.findOne({channelId: req.params.channelId})
    
    if(!dbEntry || !dbEntry.webhooks) return res.status(404).json({
        error: "No webhooks found for this channel!"
    })
    const manager = client.webhookManagers[req.params.channelId] || new WebhookManager(dbEntry.webhooks)
    client.webhookManagers[req.params.channelId] = manager
    const data = await manager.execute(await manager.findAvailableWebhook(), req.body.message, {username: req.body.username, avatar: req.body.avatar_url})
    res.status(200).json(data)
})


client.login(config.clientToken)