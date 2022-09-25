import inquirer from "inquirer"
export const data = {
    name: "dms",
    async callback(client, username) {
        const users = await client.users.all()
        const validUsers = users.map(user => user.value).filter(user => user.username.toLowerCase().includes(username.toLowerCase()))
        if(!validUsers) return console.log("User not found!")
        const selectedUserAnswer = await inquirer.prompt({
            type: "list",
            name: "username",
            message: "Select the user you want to view!",
            choices: validUsers.map(user => user.username)
        })
        const selectedUser = validUsers.find(user => user.username == selectedUserAnswer.username)
        if(!selectedUser) {
            console.log("Something went wrong!")
        }
        for(const message of selectedUser.messages) {
            console.log(`  ${message}\n`)
        }
    }
}