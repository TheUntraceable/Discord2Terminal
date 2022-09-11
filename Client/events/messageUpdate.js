// import { marked } from 'marked';
// import TerminalRenderer from 'marked-terminal';

// marked.setOptions({
//     renderer: new TerminalRenderer()
// });

import parseMentions from "../utils/parseMentions.js"

export const data = {
    name: "MESSAGE_UPDATE",
    async callback(payload) {
        if(payload.client.settings.ignoredBlocked && payload.message.author.blocked) return
        if(payload.client.settings.ignoredUsers?.includes(payload.message.author.id)) return
        const channel = payload.client.channels.get(payload.channel_id)
        if(!channel) {
            await payload.client.channels.set(payload.channel_id, {
                created: [],
                updated: [],
                deleted: []
            })
        }

        // if(payload.message.content) {
        //     payload.message.content = marked(payload.message.content)
        // }
        await parseMentions(payload)

        const message = channel.created.find(message => {
            if(!message) return false
            return message.id == payload.message.id
        })
        
        
        if(!message) {
            channel.created.push(message)
        } else {
            const index = channel.created.indexOf(message)
            const removed = channel.created.splice(index, 1)[0]
            channel.created.push(message)
            channel.updated.push(removed)
        }
   }
}