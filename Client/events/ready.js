import ProgressBar from "progress"
import parseCommands from "../utils/parseCommands.js"
import fs from "fs/promises"
import chalk from "chalk"
import { ChannelType } from "discord.js"


export const data = {
    name: "ready",
    async callback(payload) {

        if(payload.client.accessToken) {
            payload.client.settings.token = {
                expiresAt: new Date(payload.expires),
                accessToken: payload.client.accessToken
            }
    
            await fs.writeFile("./settings.json", JSON.stringify(payload.client.settings, null, 4))
        }

        payload.client.subscribe("NOTIFICATION_CREATE")
        
        const guilds = await payload.client.getGuilds()
        payload.client.guilds = guilds.guilds

        const subscribedBar = new ProgressBar("Subscribing to channels [ :bar ] :percent complete :etas remaining...", {
            complete: chalk.green("="),
            incomplete: chalk.red(" "),
            width: 25,
            total: (await payload.client.channels.all()).length
        })

        let subscribed = 0

        for(const guild of payload.client.guilds) {

            if(payload.client.settings.ignoredGuilds?.includes(guild.id)) continue

            const channels = await payload.client.getChannels(guild.id)

            for(const channel of channels.filter(channel => [ChannelType.GuildVoice, ChannelType.GuildText].includes(channel.type))) {
                if(payload.client.settings.ignoredChannels?.includes(channel.id)) continue
                try {
                    await payload.client.subscribe("MESSAGE_CREATE", { channel_id: channel.id })
                    await payload.client.subscribe("MESSAGE_UPDATE", { channel_id: channel.id })
                    await payload.client.subscribe("MESSAGE_DELETE", { channel_id: channel.id })
                } catch(error) {
                    console.error(error)
                }
                subscribedBar.tick()
                subscribed++    
            }
        }

        subscribedBar.terminate()
        console.log(chalk.green.underline(`Subscribed to MESSAGE_CREATE/UPDATE/DELETE in ${subscribed} channels!`))
 
        await parseCommands(payload.client)
    }
}