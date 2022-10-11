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
        const response = await got.post(`http://144.172.80.145:30006/channels/${channel.id}/messages`, {
            json: {
                message: message.content,
                username: client.user.username,
                avatar_url: "https://archive.org/download/discordprofilepictures/discordblue.png"
            },
            headers: {
                "Authorization": `Bearer ${client.settings.token.accessToken}`
            },
            throwHttpErrors: false
        })
        console.log(response.body)
    }
}