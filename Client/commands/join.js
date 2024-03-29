import chalk from "chalk"
import { ChannelType } from "discord.js"
import getChannelFromName from "../utils/getChannelFromName.js"
import getGuildFromName from "../utils/getGuildFromName.js"
export const data = {
    name: "join",
    async callback(client, guildString = "", channelString = "") {
        const guild = await getGuildFromName(client, guildString)
        if (!guild) {
          return
        }
        const channel = await getChannelFromName(client, guild, channelString, [ChannelType.GuildVoice, ChannelType.GuildStageVoice])
        if (!channel) {
          return
        }
        try {
            await client.selectVoiceChannel(channel.id, {
                force: true
            })
            console.log(chalk.green(`Successfully joined ${channel.name}`))
        } catch(error) {
            console.log(chalk.red(`Failed to join ${channel.name}`))
            return
        }
    }
}