import inquirer from "inquirer"
import chalk from "chalk"

const parseCommands = async client => {
    const answer = await inquirer.prompt({
        type: "input",
        name: "command",
        message: "Enter a command"
    })

    const string = answer.command
    const commandName = string.split(" ")[0]
    const args = string.split(" ").filter(arg => arg !== "").splice(1, string.split(" ").length)
    const command = client.commands[commandName]

    if(!command) {
        console.log(chalk.red.underline(`Command not found!`))
        return await parseCommands()
    }
    await command(...args).catch(error => {
        console.error(chalk.red.underline(error))
    })
    return await parseCommands()
}

export const data = {
    name: "ready",
    async callback(payload) {
        const { client } = payload
        console.log("Ready!")
        let subscribed = 0
        const spinner = createSpinner("Subscribing to events to Discord...").start()
        const guilds = await client.getGuilds()
        client.guilds = guilds.guilds
    
        for(const guild of client.guilds) {
            const channels = await client.getChannels(guild.id)
            for(const channel of channels.filter(channel => channel.type == 0)) {
                client.channels[channel.id] = []
                await client.subscribe("MESSAGE_CREATE", { channel_id: channel.id })
                subscribed++
            }
        }
        spinner.success({
            text: `Subscribed to MESSAGE_CREATE for ${subscribed}/${Object.keys(client.channels).length} channels!`
        })
        await parseCommands()    
    }
}