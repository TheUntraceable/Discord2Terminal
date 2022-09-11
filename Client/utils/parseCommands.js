import inquirer from "inquirer"
import chalk from "chalk"

export default async client => {
    const answer = await inquirer.prompt({
        type: "input",
        name: "command",
        message: "Enter a command"
    })

    let string = answer.command
    while(string[0] == " ") string = string.slice(1)
    const commandName = string.split(" ")[0]
    const args = string.split(" ").filter(arg => arg !== " ").splice(1, string.split(" ").length)
    const command = client.commands[commandName]

    if(!command) {
        console.log(chalk.red.underline(`Command not found!`))
        return await parseCommands(client)
    }
    await command(client, ...args).catch(error => {
        console.error(error)
        console.error(chalk.red.underline(error))
    })
    return await parseCommands(client)
}