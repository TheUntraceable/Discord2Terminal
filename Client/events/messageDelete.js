import filterEmpty from "../utils/filterEmpty.js";
export const data = {
    name: "MESSAGE_DELETE",
    async callback(payload) {
        if(payload.client.settings.ignoredUsers?.includes(payload.message.author.id)) return
        if(payload.client.settings.ignoredBlocked && payload.message.author.blocked) return
        
        if(!await payload.client.channels.has(payload.channel_id)) {
            const channel = await payload.client.getChannel(payload.channel_id)
            await payload.client.channels.set(payload.channel_id, {
                name: channel.name,
                created: [],
                updated: [],
                deleted: []
            })
        }
        
        const channel = await payload.client.channels.get(String(payload.channel_id))
        await filterEmpty(payload.client, payload.channel_id, channel)
        if(!channel.created.find(message => message?.id == payload.message.id)) return

        if(!channel) {
            await payload.client.channels.set(payload.channel_id, {
                created: [],
                updated: [],
                deleted: []
            })
        }

        await payload.client.channels.push(`${payload.channel_id}.deleted`, payload.message)
    }
}