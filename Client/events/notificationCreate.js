import chalk from "chalk"
import parseMentions from "../utils/parseMentions.js"
import filterEmpty from "../utils/filterEmpty.js"

export const data = {
    name: "NOTIFICATION_CREATE",
    callback: async (payload) => {
        if(payload.message.author.system) return
        if(payload.client.settings.ignoredUsers?.includes(payload.message.author.id)) return
        if(payload.client.settings.ignoreBlocked && payload.message.author.blocked) return
        const message = payload.message

        if(!await payload.client.channels.has(String(payload.channel_id))) {
            try {
                const channel = await payload.client.getChannel(payload.channel_id)
                await payload.client.channels.set(payload.channel_id, {
                    name: channel.name,
                    created: [],
                    updated: [],
                    deleted: []
                })
            } catch {
                await payload.client.channels.set(payload.channel_id, {
                    created: [],
                    updated: [],
                    deleted: []
                })
            }
        }

        const channel = await payload.client.channels.get(payload.channel_id)
        await filterEmpty(payload.client, payload.channel_id, channel)

        await parseMentions(payload)

        await payload.client.channels.push(`${payload.channel_id}.created`, message)

        if(channel.created.slice(-1)[0].author?.id != message.author.id || channel.created.length == 1) {
            console.log("\n" + chalk.hex(message.author_color || "#FFFFFF11").underline(`${message.author.username}#${message.author.discriminator} (${message.author.id}) (${chalk.blue("NOTIFICATION")})`))
        }
        console.log(`\n  ${chalk.hex(message.author_color || "#FFFFFF11")(message.content)}`)
    }
}