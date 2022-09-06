import inquirer from "inquirer"
import chalk from "chalk"

export const data = {
    name: "dms",
    async callback(client, username = "") {
        const answer = await inquirer.prompt([{
            type: "list",
            name: "user",
            message: "Select a user",
            choices: Object.values(client.users).filter(user => user.username.toLowerCase().includes(username.toLowerCase())).map(user => user.username)
        }])
        const user = Object.values(client.users).find(user => user.username === answer.user)
        const messages = Object.values(client.channels).filter(channel => channel.type == 1 && channel.id == user.id)
        console.log(messages)
        let lastAuthor = "";

        for(const message of messages) {
            let displayedText = ""
            if(message.author.id != lastAuthor) {
                displayedText += chalk.bold(`${message.author.username}#${message.author.discriminator} (${message.author.id})`)
                lastAuthor = message.author.id
            }
            displayedText += `  ${message.content}`
            console.log(displayedText)
        }
    } 
}