export const data = {
    name: "CHANNEL_CREATE",
    async callback(payload) {
        await Promise.all([
            payload.client.subscribe("MESSAGE_CREATE", { channel_id: payload.id }),
            payload.client.subscribe("MESSAGE_UPDATE", { channel_id: payload.id }),
            payload.client.subscribe("MESSAGE_DELETE", { channel_id: payload.id })
        ])
    }
}