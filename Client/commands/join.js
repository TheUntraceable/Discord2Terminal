import inquirer from "inquirer"
import chalk from "chalk"

export const data = {
    name: "join",
    async callback(client, guildString = "", channelString = "") {
        const guilds = {}
        for(const guild of client.guilds) {
            guilds[guild.name] = guild
        }
        const answer = await inquirer.prompt({
            type: "list",
            name: "guild",
            message: "Select a guild",
            choices: Object.keys(guilds).filter(guild => guild.toLowerCase().includes(guildString.toLowerCase()))
        })
        const guild = guilds[answer.guild]
    
        const _channels = await client.getChannels(guild.id)
        const channels = _channels.filter(channel => channel.type == 0)
        const channelNameToChannel = {}
       
        for(const channel of channels) {
            channelNameToChannel[channel.name.toLowerCase()] = channel
            console.log(channel.type)
        }
    
        const channel = await inquirer.prompt({
            type: "list",
            name: "channel",
            message: "Select a channel",
            choices: channels.filter(channel => [2, 13].includes(channel.type) && channel.name.toLowerCase().includes(channelString.toLowerCase())).map(channel => channel.name)
        })

        const selectedChannel = channelNameToChannel[channel.channel]
        await payload.client.selectVoiceChannel(selectedChannel.id, {
            force: true
        })
        console.log(chalk.green(`Successfully joined ${channel.name}`))
    }
}