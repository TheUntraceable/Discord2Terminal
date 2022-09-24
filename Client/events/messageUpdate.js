import filterEmpty from "../utils/filterEmpty.js"
// import { marked } from 'marked';
// import TerminalRenderer from 'marked-terminal';

// marked.setOptions({
//     renderer: new TerminalRenderer()
// });

import parseMentions from "../utils/parseMentions.js"

export const data = {
    name: "MESSAGE_UPDATE",
    async callback(payload) {
        if(payload.client.settings.ignoreBlocked && payload.message.author.blocked) return
        if(payload.client.settings.ignoredUsers?.includes(payload.message.author.id)) return

        if(!await payload.client.channels.has(payload.channel_id)) {
            const channel = await payload.client.getChannel(payload.channel_id)
            await payload.client.channels.set(payload.channel_id, {
                name: channel.name,
                created: [],
                updated: [],
                deleted: []
            })
        }
        
        const channel = await payload.client.channels.get(payload.channel_id)
        await filterEmpty(payload.client, payload.channel_id, channel)

        // if(payload.message.content) {
        //     payload.message.content = marked(payload.message.content)
        // }

        await parseMentions(payload)

        const message = channel.created.find(message => {
            return message?.id == payload.message?.id
        })
        
        if(!message) {
            channel.created.push(message)
        } else {
            const index = channel.created.indexOf(message)
            const removed = channel.created.splice(index, 1)[0]
            channel.updated.push(removed)
            channel.created.push(payload.message)
        }
        await payload.client.channels.set(payload.channel_id, channel)
   }
}