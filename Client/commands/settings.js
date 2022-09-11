import chalk from "chalk"
import fs from "fs"

export const data = {
    name: "settings",
    async callback(client, subcommand, ...args) {
        if(subcommand == "list") {
            for(const setting of Object.keys(client.settings)) {
                console.log(`${chalk.green(chalk.bold(setting))}: ${JSON.stringify(client.settings[setting])}`)
            }
        } else if(subcommand == "set") {

            const flags = {}
            for(const arg of args) {
                if(arg.startsWith("--")) {
                    flags[arg.slice(2)] = args.indexOf(arg) + 1
                }
            }

            for(const [key, value] of Object.entries(flags)) {
                if(!["ignoreUsers", "ignoreGuilds", "ignoreBlocked", "ignoreChannels", "compact"].includes(key)) continue
                client.settings[key] = value
                console.log(chalk.green(`${chalk.bold(key)}: ${value}`))
            }
            fs.writeFile("./settings.json", JSON.stringify(client.settings, null, 4), err => {if(err) console.log(`Failed to write settings with error: ${err}`)})
        }
    }
}