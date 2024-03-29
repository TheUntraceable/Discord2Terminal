import parseMentions from "../utils/parseMentions.js"
import chalk from "chalk"
import getGuildFromName from "../utils/getGuildFromName.js"
import getChannelFromName from "../utils/getChannelFromName.js"
import { ChannelType } from "discord.js"

export const data = {
    name: "select",
    async callback(client, guildString = "", channelString = "") {

        const guild = await getGuildFromName(client, guildString)
        if (!guild) {
          return
        }
        const channel = await getChannelFromName(client, guild, channelString, [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildVoice])
        if (!channel) {
          return
        }

        let message = ""
        let lastAuthor = null
        const selectedChannel = await client.channels.get(channel.id)

        if (!selectedChannel) {
          return
        }
        for(const cachedMessage of selectedChannel.created.sort((a, b) => a?.id - b?.id)) {
            if (!cachedMessage) {
              continue
            }
            if (!cachedMessage.author) {
              continue
            }
            if (client.settings.ignoreBlocked && cachedMessage.author.blocked) {
              continue
            }
            if (client.settings.ignoreUsers?.includes(cachedMessage.author.id)) {
              continue
            }
            let messageBlock = ""

            if(lastAuthor != cachedMessage.author?.id) {
                messageBlock += chalk.hex(cachedMessage.author_color || "#979c9f").underline(`${cachedMessage.author.username}#${cachedMessage.author.discriminator} (${cachedMessage.author.id})\n`)
                lastAuthor = cachedMessage.author.id
            }

            for(const updated of selectedChannel.updated.filter(updated => updated.id == cachedMessage.id)) {
                await parseMentions({
                    client: client,
                    message: updated
                })
                messageBlock += `  ${updated.content} ${chalk.grey("(outdated)")} ->`
            }

            if(selectedChannel.deleted.find(deleted => deleted.id == cachedMessage.id)) {
                await parseMentions({
                    client: client,
                    message: cachedMessage
                })
                messageBlock += `  ${chalk.hex("#ff0000")(cachedMessage.content)}\n`
            } else {
                await parseMentions({
                    client: client,
                    message: cachedMessage
                })
                messageBlock += `  ${cachedMessage.content}\n`
            }

            message += messageBlock
        }
        console.log(message)
        return message
    }
}