import { createSpinner } from "nanospinner"
import inquirer from "inquirer"
import chalk from "chalk"

const parseCommands = async client => {
    const answer = await inquirer.prompt({
        type: "input",
        name: "command",
        message: "Enter a command"
    })

    let string = answer.command
    while(string[0] == " ") string = string.slice(1)
    const commandName = string.split(" ")[0]
    const args = string.split(" ").filter(arg => arg !== "").splice(1, string.split(" ").length)
    const command = client.commands[commandName]

    if(!command) {
        console.log(chalk.red.underline(`Command not found!`))
        return await parseCommands(client)
    }
    await command(client, ...args).catch(error => {
        console.log(error)
        console.error(chalk.red.underline(error))
    })
    return await parseCommands(client)
}

export const data = {
    name: "ready",
    async callback(payload) {
        payload.client.subscribe("NOTIFICATION_CREATE")
        let subscribed = 0
        const spinner = createSpinner("Subscribing to events to Discord... (takes <2m)").start()
        const guilds = await payload.client.getGuilds()
        payload.client.guilds = guilds.guilds
    
        for(const guild of payload.client.guilds) {
            const channels = await payload.client.getChannels(guild.id)
            for(const channel of channels.filter(channel => channel.type == 0)) {
                payload.client.channels[channel.id] = {
                    created: [],
                    updated: [],
                    deleted: []
                }
                await payload.client.subscribe("MESSAGE_CREATE", { channel_id: channel.id })
                await payload.client.subscribe("MESSAGE_UPDATE", { channel_id: channel.id })
                await payload.client.subscribe("MESSAGE_DELETE", { channel_id: channel.id })
                subscribed++
            }
        }
        spinner.success({
            text: `Subscribed to MESSAGE_CREATE for ${subscribed}/${Object.keys(payload.client.channels).length} channels!`
        })
        await parseCommands(payload.client)
    }
}