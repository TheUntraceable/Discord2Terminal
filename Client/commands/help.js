export const data = {
    name: "help",
    async callback(client) {
        console.log("Commands:")
        for(const command in client.commands) {
            console.log(`${command}`)
        }
    }
}