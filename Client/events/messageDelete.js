export const data = {
    name: "MESSAGE_DELETE",
    async callback(payload) {
        const channel = payload.client.channels[payload.channel_id]
        if(!channel) return
        if(!channel.created.find(message => message.id == payload.message.id)) return
        channel.deleted.push(payload.message)
    }
}