const { Client, IntentsBitField, InteractionType, PermissionsBitField } = require("discord.js")
const { MongoClient } = require('mongodb');
const config = require("../config.json");

const client = new Client({intents: [IntentsBitField.Flags.Guilds]});

client.mongo = new MongoClient(config.mongoUri, { useNewUrlParser: true });
client.db = client.mongo.db("DiscordTerminal")
client.db.webhooks = client.db.collection("webhooks");
client.mongo.connect();

const generateDatabaseEntry = async interaction => {
    if(!await interaction.client.db.webhooks.findOne({guildId: interaction.guild.id})) {
        await interaction.client.db.webhooks.insertOne({
            guildId: interaction.guild.id,
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

                    const webhook = await interaction.guild.createWebhook({reason: `Requested by ${interaction.member.tag} (${interaction.member.id})`})

                    const payload = {
                        webhookId: webhook.id,
                        webhookToken: webhook.token,
                        channelId: interaction.channel.id
                    }

                    webhooks.push(payload)
                } 
                const existing = await interaction.client.db.webhooks.findOne({guildId: interaction.guild.id})
                existing.webhooks.push(...webhooks)
                await interaction.client.db.webhooks.updateOne({guildId: interaction.guild.id}, {$set: {webhooks: existing.webhooks}})
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
            }
        }
    }
})

client.login(config.clientToken)