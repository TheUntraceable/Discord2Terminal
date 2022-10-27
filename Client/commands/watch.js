import chalk from "chalk"
import getGuildFromName from "../utils/getGuildFromName.js"
import parseMentions from "../utils/parseMentions.js"
import inquirer from "inquirer"
import getChannelFromName from "../utils/getChannelFromName.js"

const parseWatchCommand = async (client, guild, channel) => {
    const { string } = await inquirer.prompt({
        type: "input",
        name: "string",
        message: "Enter a command: "
    })

    const [commandName, ...args] = string.split(" ")

    if(commandName == "send") {
        const command = client.commands["send"]
        await command(client, guild, channel, ...args)
    } else if(commandName == "exit") {
        return
    }

    const command = client.commands[commandName]

    if(!command) {
        console.log(chalk.red.underline(`Command ${commandName} not found`))
        return await parseWatchCommand(client, guild, channel)
    }

    await command(client).catch(error => {
        console.error(error)
        console.error(chalk.red.underline(error))
    })
    return await parseWatchCommand(client, guild, channel)
}

class State {
    constructor() {
        this.state = {}
    }

    update(newPayload) {
        const oldMessage = this.state[newPayload.message.id].current
        if(!this.state[oldMessage?.id]) {
            this.state[newPayload.message.id] = {
                current: newPayload.message,
                updates: [],
                deleted: false
            }
            return
        }

        this.state[oldMessage.id].updates.push(oldMessage)
        this.state[oldMessage.id].current = newPayload.message
    }

    getMessage(messageId) {
        return this.state[messageId]
    }

    delete(messageId) {
        if(!this.state[messageId]) return 
        this.state[messageId].deleted = true
    }

    create(payload) {
        this.state[payload.message.id] = {
            current: payload.message,
            updates: [],
            deleted: false
        }
    }
}

export const data = {
    name: "watch",
    async callback(client, guildName, channelName) {

        const guild = await getGuildFromName(client, guildName)
        if(!guild) return

        const channel = await getChannelFromName(client, guild, channelName)
        if(!channel) return

        await client.commands["select"](client, guild.name, channel.name)

        const state = new State()

        let lastAuthor = null
        let messageBlock = ""

        const messageCreate = async payload => {
            if(payload.channel_id != channel.id) return
            const { message } = payload
            await parseMentions(payload)
            state.create(payload)
            await client.channels.push(`${payload.channel_id}.created`, payload.message)

            if(lastAuthor != message?.author?.id) {
                messageBlock += chalk.hex(message.author_color || "#FFFFFF11").underline(`\n${message.author.username}#${message.author.discriminator} (${message.author.id})`)
                lastAuthor = message.author.id
                console.log(chalk.hex(message.author_color || "#FFFFFF11").underline(`\n${message.author.username}#${message.author.discriminator} (${message.author.id})`))
            }

            messageBlock += `\n  ${message.content}`
            console.clear()
            console.log(messageBlock)
        }

        const messageUpdate = async newPayload => {

            if(newPayload.channel_id != channel.id) return
            
            const oldMessage = await state.getMessage(newPayload.message.id)

            state.update(newPayload)
            
            await client.channels.pull(`${newPayload.channel_id}.created`, oldMessage)
            await client.channels.push(`${newPayload.channel_id}.updated`, oldMessage)
            await client.channels.push(`${newPayload.channel_id}.created`, newPayload.message)

            messageBlock.replace(`${oldMessage.content}`, `${oldMessage.content} ${chalk.grey(`(outdated)`)}\n  ${newPayload.message.content}`)
            console.clear()
            console.log(messageBlock)
        }

        const messageDelete = async payload => {
            if(payload.channel_id != channel.id) return
            state.delete(payload.message.id)
            messageBlock.replace(`${payload.message.content}`, chalk.red(`  ${payload.message.content}`))
        }
    
        const createWrapper = async payload => {
            try {
                await messageCreate(payload)
            } catch(e) {
                console.error(e)
            }
        }

        const updateWrapper = async payload => {
            try {
                await messageUpdate(payload)
            } catch(e) {
                console.error(e)
            }
        }

        
        const deleteWrapper = async payload => {
            try {
                await messageDelete(payload)
            } catch(e) {
                console.error(e)
            }
        }

        client.on("MESSAGE_CREATE", createWrapper)
        client.on("MESSAGE_UPDATE", updateWrapper)
        client.on("MESSAGE_DELETE", deleteWrapper)

        await parseWatchCommand(client, guild, channel )
 
        client.off("MESSAGE_CREATE", createWrapper)
        client.off("MESSAGE_UPDATE", updateWrapper)
        client.off("MESSAGE_DELETE", deleteWrapper)
    }
}