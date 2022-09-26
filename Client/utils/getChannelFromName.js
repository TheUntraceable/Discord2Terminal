import inquirer from "inquirer"
import chalk from "chalk"
import { ChannelType } from "discord.js"

export default async (client, guild, channelString = "") => {
    if(!guild) return
    const channelNameToChannel = {}
    
    const channels = await client.getChannels(guild.id)

    for(const channel of channels) {
        if(channel.type == ChannelType.GuildVoice) {
            channel.name += ` ${chalk.blue("(voice)")}`
        }

        channelNameToChannel[channel.name] = channel
    }

    if(!channels.filter(channel => channel.name.toLowerCase().includes(channelString.toLowerCase()) && !client.settings.ignoredChannels?.includes(channel.id)).map(channel => channel.name)) {
        console.log(chalk.red("Invalid channel!"))
        return
    }

    const channel = await inquirer.prompt({
        type: "list",
        name: "channel",
        message: "Select a channel",
        choices: channels.filter(channel => channel.name.toLowerCase().includes(channelString.toLowerCase()) && !client.settings.ignoredChannels?.includes(channel.id)).map(channel => channel.name)
    })
    return channelNameToChannel[channel.channel]
}