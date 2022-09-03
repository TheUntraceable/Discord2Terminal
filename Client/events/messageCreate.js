export default {
    name: "MESSAGE_CREATE",
    async callback(payload) {
        payload.message.content = marked(payload.message.content) 
        client.channels[payload.channel_id].push(payload.message)
    }
}