import { createSpinner } from "nanospinner"
import ProgressBar from "progress"
import parseCommands from "../utils/parseCommands"
import fs from "fs/promises"
import chalk from "chalk"


export const data = {
    name: "ready",
    async callback(payload) {

        payload.client.settings.token = {
            expiresAt: new Date(payload.expires),
            accessToken: payload.client.accessToken
        }

        await fs.writeFile("./settings.json", JSON.stringify(payload.client.settings, null, 4))
        payload.client.subscribe("NOTIFICATION_CREATE")
        
        let subscribed = 0
        const guilds = await payload.client.getGuilds()
        payload.client.guilds = guilds.guilds
        
        const cachingSpinner = createSpinner("Caching channels...").start()
        for(const guild of payload.client.guilds) {
            const channels = await payload.client.getChannels(guild.id)
            for(const channel of channels.filter(channel => channel.type == 0)) {
                payload.client.channels[channel.id] = {
                    created: [],
                    updated: [],
                    deleted: []
                }
            }
        }
        cachingSpinner.success({
            text: `Cached ${Object.keys(payload.client.channels).length} channels!`
        })
        console.log(chalk.green.underline(`Subscribing to events to Discord... (takes <1m)`))

        const subscriptionBar = new ProgressBar("[:bar] :rate subscriptions per second :percent done :etas :current/:total channels", { 
            total: Object.keys(payload.client.channels).length,
            complete: chalk.green("="),
            incomplete: chalk.red("-"),
            width: 50
        })

        for(const channelId of Object.keys(payload.client.channels)) {
            await payload.client.subscribe("MESSAGE_CREATE", { channel_id: channelId })
            await payload.client.subscribe("MESSAGE_UPDATE", { channel_id: channelId })
            await payload.client.subscribe("MESSAGE_DELETE", { channel_id: channelId })

            subscriptionBar.tick()
            subscribed++
        }
        subscriptionBar.terminate()
 
        console.log(chalk.green.underline(`Subscribed to MESSAGE_CREATE/UPDATE/DELETE in ${subscribed} channels!`))
        await parseCommands(payload.client)
    }
}