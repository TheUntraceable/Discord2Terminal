import chalk from "chalk"
import getChannelFromName from "../utils/getChannelFromName.js"
import getGuildFromName from "../utils/getGuildFromName.js"


export const data = {
    name: 'snipe',
    async callback(client, guildString = "", channelString = "") {
        const guild = await getGuildFromName(client, guildString)
        if (!guild) {
          return
        }
        const channel = await getChannelFromName(client, guild, channelString)
        if (!channel) {
          return
        }
        const channelMessages = await client.channels.get(channel.id)

        if(!channelMessages.deleted) {
            console.log(chalk.red("No deleted messages in this channel!"))
            return
        }

        let lastAuthor = null

        for(const message of channelMessages.created) {
            if(channelMessages.deleted.find(m => m?.id == message?.id)) {

                if(lastAuthor != message.author.id) {
                    console.log(chalk.hex(message.author_color || "#FFFFFF11").underline(message.author.username))
                }

                console.log(chalk.red(`  ${message.content}`))
                lastAuthor = message.author.id
            }
        }

    }

}