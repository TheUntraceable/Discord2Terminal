import chalk from "chalk"
import getGuildFromName from "../utils/getGuildFromName.js"
import parseMentions from "../utils/parseMentions.js"
import inquirer from "inquirer"
import PressToContinuePrompt from "inquirer-press-to-continue"
import getChannelFromName from "../utils/getChannelFromName.js"

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
        const channel = await getChannelFromName(client, guild, channelName)
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
                messageBlock += chalk.hex(message.author_color || "#FFFFFF11").underline(`\n${message.author.username}#${message.author.discriminator} (${message.author.id})\n`)
                lastAuthor = message.author.id
                console.log(chalk.hex(message.author_color || "#FFFFFF11").underline(`\n${message.author.username}#${message.author.discriminator} (${message.author.id})\n`)                )
            }

            messageBlock += `\n  ${message.content}`
            console.clear()
            console.log(messageBlock)
        }

        const messageUpdate = async newPayload => {

            if(newPayload.channel_id != channel.id) return
            
            const oldMessage = await state.getMessage(newPayload.message.id)

            state.update(newPayload)
            
            await client.channels.push(`${newPayload.channel_id}.updated`, newPayload.message)

            messageBlock.replace(`  ${oldMessage.content}`, `  ${oldMessage.content} ${chalk.grey(`(outdated)`)}\n  ${newPayload.message.content}\n`)
            console.clear()
            console.log(messageBlock)
        }

        const messageDelete = async payload => {
            if(payload.channel_id != channel.id) return
            state.delete(payload.message.id)
            messageBlock.replace(`  ${payload.message.content}`, chalk.red(`  ${payload.message.content}`))
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

        inquirer.registerPrompt("pressToContinue", PressToContinuePrompt)
        console.log(chalk.green.bold.underline("Press any key to stop watching."))
        await inquirer.prompt({
            type: "pressToContinue",
            name: "key", 
            anyKey: true,
            pressToContinueMessage: ""

        })
        client.off("MESSAGE_CREATE", createWrapper)
        client.off("MESSAGE_UPDATE", updateWrapper)
        client.off("MESSAGE_DELETE", deleteWrapper)
    }
}