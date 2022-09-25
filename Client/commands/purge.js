import inquirer from "inquirer"

export const data = {
    name: "purge",
    async callback(client) {
        const answer = await inquirer.prompt([{
            type: "list",
            name: "db",
            message: "Which database shall I purge?",
            choices: [
                "users",
                "channels"
            ]    
        }])
        const deleted = await client.db[answer.db].deleteAll()
        console.log(`Deleted ${deleted} ${answer.db}!`)
    }
}