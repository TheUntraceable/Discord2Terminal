import chalk from "chalk"
import fs from "fs"

export const data = {
    name: "settings",
    async callback(client, flags, subcommand) {
        if(subcommand == "list") {
            for(const setting of Object.keys(client.settings)) {
                console.log(`${chalk.bold(setting)}: ${client.settings[setting]}`)
            }
        } else if(subcommand == "set") {
            for([key, value] of Object.entries(flags)) {
                if(!["ignoreUsers", "ignoreGuilds", "ignoreBlocked", "ignoreChannels", "compact"].includes(key)) continue
                client.settings[key] = value
                console.log(chalk.green(`${chalk.bold(key)}: ${value}`))
            }
            fs.writeFile("../settings.json", JSON.stringify(client.settings, null, 4), err => console.log(`Failed to write settings with error: ${err}`))
        }
    }
}