import { createSpinner } from "nanospinner"
import ProgressBar from "progress"
import parseCommands from "../utils/parseCommands.js"
import fs from "fs/promises"
import chalk from "chalk"
import { ChannelType } from "discord.js"


export const data = {
    name: "ready",
    async callback(payload) {

        payload.client.settings.token = {
            expiresAt: new Date(payload.expires),
            accessToken: payload.client.accessToken
        }

        await fs.writeFile("./settings.json", JSON.stringify(payload.client.settings, null, 4))
        payload.client.subscribe("NOTIFICATION_CREATE")
        
        const guilds = await payload.client.getGuilds()
        payload.client.guilds = guilds.guilds
        
        const cachingSpinner = createSpinner("Caching channels...").start()
        for(const guild of payload.client.guilds) {

            if(payload.client.settings.ignoredGuilds?.includes(guild.id)) continue

            const channels = await payload.client.getChannels(guild.id)

            for(const channel of channels.filter(channel => [ChannelType.GuildVoice, ChannelType.GuildText].includes(channel.type))) {
                if(!channel.id) return
                if(payload.client.settings.ignoredChannels?.includes(channel.id)) {
                    if(await payload.client.channels.has(channel.id)) {
                        await payload.client.channels.delete(channel.id)
                    }
                    continue
                }
                if(!await payload.client.channels.has(channel.id)) {
                    await payload.client.channels.set(channel.id, {
                        name: channel.name,
                        created: [],
                        updated: [],
                        deleted: []
                    })
                }
            }
        }
        cachingSpinner.success({
            text: `Stored ${(await payload.client.channels.all()).length} channels!`
        })

        let subscribed = 0
        const subscribedBar = new ProgressBar("Subscribing to channels [ :bar ] :percent complete :etas remaining...", {
            complete: chalk.green("="),
            incomplete: chalk.red(" "),
            width: 25,
            total: (await payload.client.channels.all()).length
        })

        for(const channel of await payload.client.channels.all()) {
            if(payload.client.settings.ignoredChannels?.includes(channel.id)) {
                console.log("Included...")
                continue
            }
            try {
                console.log("Subscribing to channel", channel.id)
                await payload.client.subscribe("MESSAGE_CREATE", { channel_id: channel.id })
                payload.client.subscribe("MESSAGE_UPDATE", { channel_id: channel.id })
                payload.client.subscribe("MESSAGE_DELETE", { channel_id: channel.id })
            } catch(error) {
                console.error(error)
                await payload.client.channels.delete(channel.id)
            }
            subscribedBar.tick()
            subscribed++

        }
        subscribedBar.terminate()
 
        console.log(chalk.green.underline(`Attempted to subscribe to MESSAGE_CREATE/UPDATE/DELETE in ${subscribed} channels!`))
        await parseCommands(payload.client)
    }
}