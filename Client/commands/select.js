import inquirer from "inquirer"
import chalk from "chalk"


export const data = {
    name: "select",
    callback: async (client, guildString = "", channelString = "") => {
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
        }
    
        const channel = await inquirer.prompt({
            type: "list",
            name: "channel",
            message: "Select a channel",
            choices: channels.filter(channel => channel.type == 0 && channel.name.toLowerCase().includes(channelString.toLowerCase())).map(channel => channel.name)
        })
    
        var message = ""
        var lastAuthor = null
        for(const cachedMessage of client.channels[String(channelNameToChannel[channel.channel].id)]) {
            
            var messageBlock = ""
            if(lastAuthor != cachedMessage.author.id) {
                messageBlock += chalk.hex(cachedMessage.author_color || "#FFFFFF11").underline(`${cachedMessage.author.username}#${cachedMessage.author.discriminator} (${cachedMessage.author.id})`)
                messageBlock += "\n"
                lastAuthor = cachedMessage.author.id
            }
            messageBlock += `  ${chalk.hex(cachedMessage.author_color || "#FFFFFF11")(cachedMessage.content)}`
            message += messageBlock
        }
        console.log(message)
    }
}