import { createSpinner } from "nanospinner"
import fs from "fs"

export async function load(client) {
    const commandSpinner = createSpinner("Loading commands...").start()

    client.addCommand("cls", async () => {
        console.clear()
    }).addCommand("eval", async (code = "") => {
        eval(code)
    }).addCommand("clear", async () => {
        console.clear()
    })
    
    for(const file of fs.readdirSync("./commands")) {
        const spinner = createSpinner(`Loading command ${file}...`).start()
        const command = await import(`../commands/${file}`)
        const callback = async (...args) => {
            await command.data.callback(client, ...args)
        }
        client.addCommand(command.data.name, callback)
        spinner.success({
            text: `Loaded command ${file}!`
        })
    
    }
    
    commandSpinner.success({
        text: `Loaded ${Object.keys(client.commands).length} commands!`
    })
    
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