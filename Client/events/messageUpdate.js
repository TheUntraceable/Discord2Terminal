export const data = {
    name: "MESSAGE_UPDATE",
    async callback(payload) {
        const channel = payload.client.channels[payload.channel_id]
        if(!channel) return
        channel.updated.push(payload.message)
   }
}