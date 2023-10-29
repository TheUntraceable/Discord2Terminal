import chalk from "chalk"
import inquirer from "inquirer"

export default async (client, guildString = "") => {

    const guilds = {}

    for(const guild of client.guilds) {
        guilds[guild.name] = guild
        if(guild.name.toLowerCase() == guildString.toLowerCase()) {
            return guild
        }
    }
    const filteredGuilds = Object.keys(guilds).filter(guild => guild.toLowerCase().includes(guildString.toLowerCase()) && !client.settings.ignoredGuilds?.includes(guild.id))
    if(!filteredGuilds.length) {
        console.log(chalk.red("Invalid guild!"))
        return
    }

    const answer = await inquirer.prompt({
        type: "list",
        name: "guild",
        message: "Select a guild",
        choices: filteredGuilds
    })

    const guild = guilds[answer.guild]

    if(!guild) {
        console.log(chalk.red("Failed to get guild. Guild may not exist"))
        return
    }
    return guild
}