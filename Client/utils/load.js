import { createSpinner } from "nanospinner"
import fs from "fs"

const loadCommands = async client => {
    const commandSpinner = createSpinner("Loading commands...").start()

    for(const file of fs.readdirSync("./commands")) {
        const spinner = createSpinner(`Loading command ${file}...`).start()
        const command = await import(`../commands/${file}`)

        client.addCommand(command.data.name, command.data.callback)

        spinner.success({
            text: `Loaded command ${file}!`
        })
    
    }

    commandSpinner.success({
        text: `Loaded ${Object.keys(client.commands).length} commands!`
    })
}

const loadEvents = async client => {
    const eventSpinner = createSpinner("Loading events...").start()
    let events = 0
    
    for(const file of fs.readdirSync("./events")) {
        const spinner = createSpinner(`Loading event ${file}...`).start()
        const event = await import(`../events/${file}`)
        
        client.on(event.data.name, async payload => {
            payload.client = client
            await event.data.callback(payload).catch(console.error)
        })
        events++
        spinner.success({
            text: `Loaded event ${file}!`
        })
    }
    
    eventSpinner.success({
        text: `Loaded ${events} events!`
    })
}

export async function load(client) {
    await loadCommands(client)
    await loadEvents(client)
}