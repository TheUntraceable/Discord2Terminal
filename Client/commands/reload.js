import chalk from "chalk"

export const data = {
    name: "reload",
    async callback(client, commandName) {
        const command = client.commands[commandName]
        if(!command) {
            console.log(chalk.hex("#FF0000")(`Command ${commandName} not found.`))
            return
        }
        delete client.commands[commandName]
        const newCommand = await import(`./${commandName}.js`)
        client.addCommand(newCommand.data.name, newCommand.data.callback)
    }
}