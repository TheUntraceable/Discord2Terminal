import inquirer from "inquirer"
import got from "got"
import { ChannelType } from "discord.js"
import getChannelFromName from "../utils/getChannelFromName.js"
import getGuildFromName from "../utils/getGuildFromName.js"
import chalk from "chalk"

export const data = {
    name: "send",
    async callback(client, guildString, channelString) {
        const guild = await getGuildFromName(client, guildString)
        if(!guild) return
        const channel = await getChannelFromName(client, guild, channelString, [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread])
        if(!channel) return
        const message = await inquirer.prompt({
            type: "input",
            name: "content",
            message: "Message content: "
        })
        const response = await got.post(`http://144.172.80.145:30006/channels/${channel.id}/messages`, {
            json: {
                message: message.content
            },
            headers: {
                "Authorization": `Bearer ${client.settings.token.accessToken}`
            },
            throwHttpErrors: false
        })
        if(JSON.parse(response.body)?.error) {
            console.log(chalk.red(JSON.parse(response.body).error))
        }
    }
}