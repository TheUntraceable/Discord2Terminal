import inquirer from "inquirer";
import chalk from "chalk";

export const data = {
    name: "exit",
    async callback(client) {
        const { confirm } = await inquirer.prompt({
            type: "confirm",
            name: "confirm",
            message: "Are you sure you want to exit?",
        });

        if (confirm) {
            console.log(chalk.green("Exiting..."));
            await client.selectVoiceChannel(null);
            client.destroy();
            process.exit(0);
        }
    }
}