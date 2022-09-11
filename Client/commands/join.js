import chalk from "chalk"
import { ChannelType } from "discord.js"
import { getChannelFromName } from "../utils/getChannelFromName"
import { getGuildFromName } from "../utils/getGuildFromName"

export const data = {
    name: "join",
    async callback(client, guildString = "", channelString = "") {
        const guild = await getGuildFromName(client, guildString)
        const channel = await getChannelFromName(client, guild, channelString,-0 [ChannelType.GuildVoice, ChannelType.GuildStageVoice])
        try {
            await client.selectVoiceChannel(selectedChannel.id, {
                force: true
            })
            console.log(chalk.green(`Successfully joined ${channel.channel}`))
        } catch(error) {
            console.log(chalk.red(`Failed to join ${channel.channel}`))
            client.emit("commandError", error)
        }
    }
}