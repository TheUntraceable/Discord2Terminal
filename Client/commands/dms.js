export const data = {
    name: "dms",
    async callback(client) {
        const users = await client.users.all()
        for(const user of users.map(x => x.value)) {
            console.log(user)
        }
    }
}