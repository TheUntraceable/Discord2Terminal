import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
    renderer: new TerminalRenderer()
});

export const data = {
    name: "MESSAGE_UPDATE",
    async callback(payload) {
        const channel = payload.client.channels[payload.channel_id]
        if(!channel) return
        payload.message.content = marked(payload.message.content)
        const message = channel.created.find(message => {
            if(!message) return false
            return message.id == payload.message.id
        })
        if(!message) {
            channel.created.push(message)
            return
        } else {
            const index = channel.created.indexOf(message)
            const removed = channel.created.splice(index, 1)[0]
            channel.created[index] = payload.message
            channel.updated.push(removed)
        }
   }
}