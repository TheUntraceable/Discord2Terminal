import inquirer from "inquirer"
import got from "got"
import { ChannelType } from "discord.js"
import getChannelFromName from "../utils/getChannelFromName.js"
import getGuildFromName from "../utils/getGuildFromName.js"

export const data = {
    name: "send",
    async callback(client, guildString, channelString) {
        const guild = await getGuildFromName(client, guildString)
        const channel = await getChannelFromName(client, guild, channelString, [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread])
        const message = await inquirer.prompt({
            type: "input",
            name: "content",
            message: "Message content: "
        })
        await got.post(`https://discord2terminal.theuntraceable.tech/channels/${channel.id}/messages`, {
            json: {
                message: message.content,
                username: client.user.username,
                avatar_url: `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png`
            }
        }) // More Soon™️
    }
}