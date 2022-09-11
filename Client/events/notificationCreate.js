import chalk from "chalk"
import parseMentions from "../utils/parseMentions"

export const data = {
    name: "NOTIFICATION_CREATE",
    callback: async (payload) => {
        if(payload.message.author.system) return
        const message = payload.message

        if(!payload.client.channels[message.channel_id]) {
            payload.client.channels[message.channel_id] = {
                created: [],
                updated: [],
                deleted: []
            }
            pushed = true
        }

        const channel = payload.client.channels[message.channel_id]

        await parseMentions(payload)

        channel.created.push(message)

        if(channel.created.slice(-1)[0].author.id != message.author.id || channel.created.length == 1) {
            console.log("\n" + chalk.hex(message.author_color || "#FFFFFF11").underline(`${message.author.username}#${message.author.discriminator} (${message.author.id})`))
        }
        console.log(`\n  ${chalk.hex(message.author_color || "#FFFFFF11")(message.content)}`)
    }
}