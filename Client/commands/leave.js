import chalk from "chalk"

export const data = {
    name: "leave",
    async callback(client) {
        await client.selectVoiceChannel(null)
        console.log(chalk.green.underline("Left voice channel!"))
    }
}