import inquirer from "inquirer"

export const getGuildFromName = async (client, guildString = "") => {

    const guilds = {}

    for(const guild of client.guilds) {
        guilds[guild.name] = guild
    }

    if(!Object.keys(guilds).filter(guild => guild.toLowerCase().includes(guildString.toLowerCase()))) {
        console.log(chalk.red("Invalid guild!"))
        return
    }

    const answer = await inquirer.prompt({
        type: "list",
        name: "guild",
        message: "Select a guild",
        choices: Object.keys(guilds).filter(guild => guild.toLowerCase().includes(guildString.toLowerCase()) && !client.settings.ignoredGuilds?.includes(guild.id))
    })

    const guild = guilds[answer.guild]

    if(!guild) {
        console.log(chalk.red("Failed to get channels. Guild may not exist"))
        return
    }
    return guild
}