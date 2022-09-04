import chalk from "chalk"

export const data = {
    name: "NOTIFICATION_CREATE",
    callback: async (payload) => {
        if(payload.message.author.system) return
        const message = payload.message
        let pushed = false

        if(!payload.client.channels[message.channel_id]) {
            payload.client.channels[message.channel_id] = [message]
            pushed = true
        }
        const channel = payload.client.channels[message.channel_id]

        if(channel.slice(-1)[0].author.id != message.author.id || channel.length == 1) {
            console.log("\n" + chalk.hex(message.author_color || "#FFFFFF11").underline(`${message.author.username}#${message.author.discriminator} (${message.author.id})`))
        }
        console.log(`\n  ${chalk.hex(message.author_color || "#FFFFFF11")(message.content)}`)
        if(!pushed) channel.push(message)
    }
}