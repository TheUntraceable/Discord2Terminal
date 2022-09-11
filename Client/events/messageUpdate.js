// import { marked } from 'marked';
// import TerminalRenderer from 'marked-terminal';

// marked.setOptions({
//     renderer: new TerminalRenderer()
// });

import parseMentions from "../utils/parseMentions.js"

export const data = {
    name: "MESSAGE_UPDATE",
    async callback(payload) {
        const channel = payload.client.channels[payload.channel_id]
        if(!channel) return

        // if(payload.message.content) {
        //     payload.message.content = marked(payload.message.content)
        // }
        await parseMentions(payload)

        const message = channel.created.find(message => {
            if(!message) return false
            return message.id == payload.message.id
        })
        
        channel.created.push(message)
        if(!message) {
            return
        } else {
            const index = channel.created.indexOf(message)
            const removed = channel.created.splice(index, 1)[0]
            channel.updated.push(removed)
        }
   }
}