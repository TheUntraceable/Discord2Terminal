import inquirer from "inquirer"
import chalk from "chalk"

export const data = {
    name: "select",
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
        if(!guild) {
            console.log(chalk.red("Failed to get channels. Guild may not exist"))
            return
        }
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
            choices: channels.filter(channel => channel.name.toLowerCase().includes(channelString.toLowerCase())).map(channel => channel.name)
        })
    
        let message = ""
        let lastAuthor = null
        const selectedChannel = client.channels[String(channelNameToChannel[channel.channel].id)]
        for(const cachedMessage of selectedChannel.created.sort((a, b) => a.id - b.id)) {

            let messageBlock = ""

            if(lastAuthor != cachedMessage.author.id) {
                messageBlock += chalk.hex(cachedMessage.author_color || "#FFFFFF11").underline(`${cachedMessage.author.username}#${cachedMessage.author.discriminator} (${cachedMessage.author.id})\n`)
                lastAuthor = cachedMessage.author.id
            }
            
            for(const updated of selectedChannel.updated.filter(updated => updated.id == cachedMessage.id)) {
                messageBlock += `  ${chalk.hex("#0000ff")(updated.content)}\n`
            }
            if(selectedChannel.deleted.find(deleted => deleted.id == cachedMessage.id)) {
                console.log("Passed")
                messageBlock += `  ${chalk.red(cachedMessage.content)}\n`
            } else {
                console.log("Failed")
                messageBlock += `  ${cachedMessage.content}\n`
            }

            message += messageBlock
        }

        console.log(message)
    }
}