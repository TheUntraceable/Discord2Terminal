import inquirer from "inquirer"
import { ChannelType } from "discord.js"

export default async (client, guild, channelString = "", channelTypes = Object.values(ChannelType)) => {
    const channels = (await client.getChannels(guild.id))
    const channelNameToChannel = {}
    
    for(const channel of channels) {
        channelNameToChannel[channel.name.toLowerCase()] = channel
    }

    if(!channels.filter(channel => channel.name.toLowerCase().includes(channelString.toLowerCase()) && !client.settings.ignoredChannels?.includes(channel.id) && channelTypes.includes(channel.type)).map(channel => channel.name)) {
        console.log(chalk.red("Invalid channel!"))
        return
    }
    
    const channel = await inquirer.prompt({
        type: "list",
        name: "channel",
        message: "Select a channel",
        choices: channels.filter(channel => channel.name.toLowerCase().includes(channelString.toLowerCase()) && !client.settings.ignoredChannels?.includes(channel.id)).map(channel => channel.name)
    })
    return channel.channel
}