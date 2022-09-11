export const data = {
    name: "MESSAGE_DELETE",
    async callback(payload) {
        if(payload.client.settings.ignoredUsers.includes(payload.message.author.id)) return
        if(payload.client.settings.ignoredBlocked && payload.message.author.blocked) return
        const channel = payload.client.channels.get(payload.channel_id)
        if(!channel) {
            await payload.client.channels.set(payload.channel_id, {
                created: [],
                updated: [],
                deleted: []
            })
        }
        if(!channel.created.find(message => message.id == payload.message.id)) return
        await payload.client.channels.push(`${payload.channel_id}.deleted`, payload.message)
    }
}