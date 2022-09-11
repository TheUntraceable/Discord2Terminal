import { getGuildFromName } from "../utils/getGuildFromName.js"
import { getChannelFromName } from "../utils/getChannelFromName.js"
import chalk from "chalk"
import { ChannelType } from "discord.js"

export const data = {
    name: "select",
    async callback(client, guildString = "", channelString = "") {
        const guild = await getGuildFromName(client, guildString)
        await getChannelFromName(client, guild, channelString, [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread])

        let message = ""
        let lastAuthor = null

        const selectedChannel = client.channels[String(channelNameToChannel[channel.channel].id)]
        for(const cachedMessage of selectedChannel.created.sort((a, b) => a.id - b.id)) {

            if(client.settings.ignoreBlocked && cachedMessage.author.blocked) continue
            if(client.settings.ignoreUsers.includes(cachedMessage.author.id)) continue

            let messageBlock = ""

            if(lastAuthor != cachedMessage.author?.id) {
                messageBlock += chalk.hex(cachedMessage.author_color || "#FFFFFF11").underline(`${cachedMessage.author.username}#${cachedMessage.author.discriminator} (${cachedMessage.author.id})\n`)
                lastAuthor = cachedMessage.author.id
            }
            
            for(const updated of selectedChannel.updated.filter(updated => updated.id == cachedMessage.id)) {
                messageBlock += `  ${chalk.hex("#0000ff")(updated.content)}\n`
            }

            if(selectedChannel.deleted.find(deleted => deleted.id == cachedMessage.id)) {
                messageBlock += `  ${chalk.hex("#ff0000")(cachedMessage.content)}\n`
            } else {
                messageBlock += `  ${cachedMessage.content}\n`
            }

            message += messageBlock
        }
        console.log(message)
    }
}